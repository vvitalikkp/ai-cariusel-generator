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

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0]
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v")
      if (v) return v
      const match = u.pathname.match(/\/(?:embed|shorts|v)\/([^/?]+)/)
      if (match) return match[1]
    }
  } catch {}
  return null
}

async function fetchYouTubeData(videoId: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  const metaRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
    { signal: AbortSignal.timeout(8000) }
  )
  if (!metaRes.ok) return null
  const meta = await metaRes.json()
  const item = meta.items?.[0]
  if (!item) return null

  const title = item.snippet?.title ?? ""
  const description = (item.snippet?.description ?? "").slice(0, 2000)
  const tags = (item.snippet?.tags ?? []).slice(0, 10).join(", ")

  const result = [
    `Video Title: ${title}`,
    tags ? `Tags: ${tags}` : "",
    `Description: ${description}`,
  ].filter(Boolean).join("\n\n")

  return result || null
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

    // YouTube — используем Data API
    const youtubeId = extractYouTubeId(url)
    if (youtubeId) {
      const youtubeText = await fetchYouTubeData(youtubeId)
      if (youtubeText) {
        return NextResponse.json({ text: youtubeText, source: "youtube" })
      }
      return NextResponse.json({ error: "youtube_failed" })
    }

    // Обычные сайты — скрейпинг
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
