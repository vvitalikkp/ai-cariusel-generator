import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { topic } = await req.json()
  if (!topic || topic.length < 3) {
    return NextResponse.json({ error: "invalid_topic" }, { status: 400 })
  }

  const prompt = `You are a LinkedIn carousel expert. Generate the FIRST slide only for a carousel about: "${topic}"

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": "a bold punchy hook headline (max 8 words)",
  "subtitle": "one engaging sentence that hooks the reader (max 15 words)",
  "points": ["point 1 (max 6 words)", "point 2 (max 6 words)"]
}`

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text ?? ""
    const clean = text.replace(/```json|```/g, "").trim()
    const slide = JSON.parse(clean)

    return NextResponse.json({ slide })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "generation_failed" }, { status: 500 })
  }
}
