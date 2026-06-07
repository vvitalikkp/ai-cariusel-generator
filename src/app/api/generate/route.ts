import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: "No API key" }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })
    const body = await req.json()
    const { idea, style } = body

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Create a LinkedIn carousel about: ${idea}. Style: ${style}. 
Return ONLY a valid JSON array of exactly 6 slides. Each slide must have:
- "title": short punchy title (max 6 words) with a relevant emoji at the start
- "description": Write 4-6 sentences (minimum 100 words). Include specific examples, statistics, or actionable steps. Be detailed and valuable. Fill the space with rich content.
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
    
    return NextResponse.json({ slides })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}