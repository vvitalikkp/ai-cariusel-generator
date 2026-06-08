import { NextResponse } from "next/server"
import OpenAI from "openai"
import { supabase } from "@/lib/supabase"

const FREE_LIMIT = 5

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
        .select("count")
        .eq("email", email)
        .single()

      if (row && row.count >= FREE_LIMIT) {
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
- "description": 2-3 sentences, maximum 120 characters total. Be specific and punchy.

- "type": one of [hook, problem, mistake, solution, framework, cta]

Slide structure:
1. Hook - grab attention with bold claim
2. Problem - pain point people relate to
3. Mistake - common mistake people make
4. Solution - the key insight
5. Framework - actionable steps
6. CTA - call to action

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