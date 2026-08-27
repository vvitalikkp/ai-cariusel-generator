import { NextResponse } from "next/server"
import OpenAI from "openai"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { DAILY_FAIR_USE_LIMIT, REFERRAL_BONUS, monthlyCountFromRow, dailyCountFromRow, effectiveFreeLimit } from "@/lib/limits"
import { getReferralCode } from "@/lib/referral"

const TONE_PRESETS: Record<string, string> = {
  Storytelling: "Write in a first-person, narrative voice. Use a personal anecdote or relatable journey arc, with vulnerability and concrete moments — make it feel like a real story, not a lecture.",
  Authority: "Write like a confident expert teaching from experience. Use clear, declarative statements and named frameworks. Establish credibility through specificity, not bragging.",
  Contrarian: "Open by stating what most people believe or were told to do, then flip it. Be provocative and direct, and back the contrarian claim with a concrete reason.",
  "Data-Driven": "Lead with numbers, percentages, or concrete evidence in nearly every slide. Make claims feel proven with specific figures rather than vague assertions.",
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "No API key" }, { status: 500 })
    }

    // Identity comes from the server-verified session, never the request
    // body. Previously any caller could pass an arbitrary `email` and either
    // burn a real user's free-tier quota, or — worse — ride on a paying
    // Pro/LTD user's account to get free unlimited gpt-4o generations by
    // simply knowing (or guessing) their email. There was no check that the
    // caller actually *was* that person.
    const session = await getServerSession(authOptions)
    const email = session?.user?.email

    if (!email) {
      return NextResponse.json({ error: "sign_in_required" })
    }

    const openai = new OpenAI({ apiKey })
    const body = await req.json()
    const { idea, style, tone, mode, isRegenerate, ref } = body
    const toneInstruction = TONE_PRESETS[tone] || TONE_PRESETS.Authority

    const { data: row } = await supabase
      .from("generation_counts")
      .select("count, is_pro, updated_at, daily_count, daily_updated_at, bonus_generations, referred_by, referral_code")
      .eq("email", email)
      .single()

    // Referral attribution — double-sided, runs at most once per referred
    // user (the very first time they hit this endpoint with a ?ref= code
    // still in localStorage). Guarded on `referred_by` being unset so
    // re-generating, clearing localStorage, or revisiting the link later
    // can't re-credit either side. Self-referrals (own code) are ignored,
    // not erroed. The referred user's own +REFERRAL_BONUS is applied via
    // the upsert further down (referredBonus), since their row may not
    // exist yet on their very first generation.
    const myCode = getReferralCode(email)
    let referredBonus = 0
    if (ref && !row?.referred_by && ref !== myCode) {
      const { data: referrer } = await supabase
        .from("generation_counts")
        .select("email, bonus_generations")
        .eq("referral_code", ref)
        .single()
      if (referrer && referrer.email !== email) {
        await supabase
          .from("generation_counts")
          .update({ bonus_generations: (referrer.bonus_generations || 0) + REFERRAL_BONUS })
          .eq("email", referrer.email)
        referredBonus = REFERRAL_BONUS
      }
    }

    const isPro = row?.is_pro || false

    // Fair-use cap on paid accounts (Pro + LTD). This is not the marketing
    // "unlimited" — it exists to protect unit economics on every GPT-4o call.
    // Applies to both carousel and LinkedIn-post generation, since both hit
    // the paid model. Free-tier users never get near this — they're already
    // capped at FREE_LIMIT/month.
    const dailyCount = dailyCountFromRow(row)
    if (isPro && dailyCount >= DAILY_FAIR_USE_LIMIT) {
      return NextResponse.json({ error: "daily_limit_reached" })
    }

    if (mode === "linkedin_post" && !isPro) {
      return NextResponse.json({ error: "pro_required" })
    }

    if (mode === "linkedin_post") {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `Write a LinkedIn post (150-220 words) to accompany a carousel about: ${idea}.

Requirements:
- First line: a bold hook that stops the scroll (no question as opener, make a strong statement or counterintuitive claim)
- Body: 3-5 short punchy paragraphs, each 1-2 sentences. Concrete and specific — no filler phrases like "game-changer", "unlock your potential", "in today's world"
- End with a direct CTA: ask a specific question to drive comments OR give one concrete next step
- Add 3-5 relevant hashtags on the last line
- Use line breaks generously for readability
- No emojis unless they genuinely add meaning (max 2)

Return only the post text, no extra explanation.`,
          }
        ]
      })
      const post = response.choices[0].message.content?.trim() || ""

      await supabase
        .from("generation_counts")
        .upsert(
          { email, is_pro: isPro, daily_count: dailyCount + 1, daily_updated_at: new Date().toISOString(), referral_code: row?.referral_code || myCode },
          { onConflict: "email" }
        )

      return NextResponse.json({ post })
    }

    const monthlyCount = monthlyCountFromRow(row)
    const myFreeLimit = effectiveFreeLimit(row)

    if (!isPro && monthlyCount >= myFreeLimit) {
      return NextResponse.json({ error: "limit_reached" })
    }

    const response = await openai.chat.completions.create({
      model: isPro ? "gpt-4o" : "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a LinkedIn carousel about: ${idea}. Style: ${style}.
Tone: ${toneInstruction}
Return ONLY a valid JSON array of exactly 6 slides. Each slide must have:
- "title": a short, punchy headline (4-8 words). Declarative, no filler words, no generic phrases like "unlock your potential" or "shift your mindset".
- "description": 2-3 short, direct sentences (max 180 characters). Concrete and specific — use a named mechanism or a real example instead of vague encouragement. Do not reference "our community", "my page", or any group that may not exist for a solo creator.
- "type": one of [hook, problem, mistake, solution, framework, cta]

Slide structure:
1. Hook - bold claim that grabs attention and promises value
2. Problem - specific pain point your audience feels every day
3. Mistake - the most common mistake people make and why it hurts them
4. Solution - the key insight or mindset shift that changes everything
5. Framework - 3 actionable steps anyone can apply today
6. CTA - a direct call to action, e.g. asking a question to drive comments, or a concrete next step — not a generic "follow for more"

Return ONLY the JSON array, no markdown, no extra text.`,
        }
      ]
    })

    const text = response.choices[0].message.content || "[]"
    const clean = text.replace(/```json|```/g, "").trim()
    const slides = JSON.parse(clean)

    // A regenerate call (redoing one slide within an already-generated carousel)
    // still requires quota (so it can't be spammed to bypass the free-tier cap),
    // but it shouldn't burn an extra "carousel" from the monthly count — only a
    // brand-new carousel does that. The daily fair-use count, on the other hand,
    // always increments — it tracks raw API cost, not carousels.
    const nextMonthlyCount = isRegenerate ? monthlyCount : monthlyCount + 1

    await supabase
      .from("generation_counts")
      .upsert(
        {
          email,
          count: nextMonthlyCount,
          is_pro: isPro,
          updated_at: new Date().toISOString(),
          daily_count: dailyCount + 1,
          daily_updated_at: new Date().toISOString(),
          referral_code: row?.referral_code || myCode,
          referred_by: row?.referred_by || (ref && ref !== myCode ? ref : null),
          bonus_generations: (row?.bonus_generations || 0) + referredBonus,
        },
        { onConflict: "email" }
      )

    return NextResponse.json({ slides, isPro, used: nextMonthlyCount, limit: myFreeLimit + referredBonus })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
