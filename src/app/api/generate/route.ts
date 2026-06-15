import { NextResponse } from "next/server"
import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

const FREE_LIMIT = 3

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "No API key" }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })
    const body = await req.json()
    const { idea, style, email } = body

    if (email) {
      const { data: row } = await supabase
        .from("generation_counts")
        .select("count, is_pro")
        .eq("email", email)
        .single()

      const isPro = row?.is_pro || false
      const count = row?.count || 0

      if (!isPro && count >= FREE_LIMIT) {
        return NextResponse.json({ error: "limit_reached" })
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a LinkedIn carousel about: ${idea}. Style: ${style}.
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
      await supabase.rpc("increment_generation_count", { user_email: email })
    }

    return NextResponse.json({ slides })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}