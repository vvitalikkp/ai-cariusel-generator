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
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ""
    const slide = JSON.parse(text)

    return NextResponse.json({ slide })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "generation_failed" }, { status: 500 })
  }
}
