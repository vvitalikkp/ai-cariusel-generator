import { NextResponse } from "next/server"

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === "localhost" || h.endsWith(".local")) return true
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (h.startsWith("169.254.")) return true
  if (h === "0.0.0.0" || h === "::1") return true
  return false
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: "invalid_url" })
    }

    if (!["http:", "https:"].includes(parsed.protocol) || isPrivateHost(parsed.hostname)) {
      return NextResponse.json({ error: "invalid_url" })
    }

    const res = await fetch(parsed.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CarouselAI/1.0)" },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "fetch_failed" })
    }

    const html = await res.text()

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&[a-z0-9#]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()

    if (!text || text.length < 50) {
      return NextResponse.json({ error: "no_content" })
    }

    return NextResponse.json({ text: text.slice(0, 3000) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "fetch_failed" })
  }
}
