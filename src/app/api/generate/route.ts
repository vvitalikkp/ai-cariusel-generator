import { NextResponse } from "next/server"
import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

const FREE_LIMIT = 3

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

    const openai = new OpenAI({ apiKey })
    const body = await req.json()
    const { idea, style, tone, email } = body
    const toneInstruction = TONE_PRESETS[tone] || TONE_PRESETS.Authority

    let monthlyCount = 0
    let isPro = false

    if (email) {
      const { data: row } = await supabase
        .from("generation_counts")
        .select("count, is_pro, updated_at")
        .eq("email", email)
        .single()

      isPro = row?.is_pro || false

      const lastUpdate = row?.updated_at ? new Date(row.updated_at) : null
      const now = new Date()
      const sameMonth = !!lastUpdate &&
        lastUpdate.getUTCFullYear() === now.getUTCFullYear() &&
        lastUpdate.getUTCMonth() === now.getUTCMonth()
      monthlyCount = sameMonth ? (row?.count || 0) : 0

      if (!isPro && monthlyCount >= FREE_LIMIT) {
        return NextResponse.json({ error: "limit_reached" })
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a LinkedIn carousel about: ${idea}. Style: ${style}.
Tone: ${toneInstruction}
Return ONLY a valid JSON array of exactly 6 slides. Each slide must have:
- "title": a short, bold headline (5-10 words max). Punchy and attention-grabbing.
- "description": 3-4 full sentences (150-250 characters). Be specific, practical, and valuable. Give real insight, not fluff.
- "type": one of [hook, problem, mistake, solution, framework, cta]

Slide structure:
1. Hook - bold claim that grabs attention and promises value
2. Problem - specific pain point your audience feels every day
3. Mistake - the most common mistake people make and why it hurts them
4. Solution - the key insight or mindset shift that changes everything
5. Framework - 3 actionable steps anyone can apply today
6. CTA - compelling call to action with clear next step

Return ONLY the JSON array, no markdown, no extra text.`,
        }
      ]
    })

    const text = response.choices[0].message.content || "[]"
    const clean = text.replace(/```json|```/g, "").trim()
    const slides = JSON.parse(clean)

    if (email) {
      await supabase
        .from("generation_counts")
        .upsert(
          { email, count: monthlyCount + 1, is_pro: isPro, updated_at: new Date().toISOString() },
          { onConflict: "email" }
        )
    }

    return NextResponse.json({ slides, isPro })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}