import { NextResponse } from "next/server"
import { YoutubeTranscript } from "youtube-transcript"

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match?.[1] ?? null
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    const videoId = extractVideoId(url ?? "")
    if (!videoId) {
      return NextResponse.json({ error: "invalid_url" }, { status: 400 })
    }

    // Fetch transcript — try English first, fall back to any available language
    let segments
    try {
      segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" })
    } catch {
      try {
        segments = await YoutubeTranscript.fetchTranscript(videoId)
      } catch {
        return NextResponse.json({ error: "no_captions" })
      }
    }

    if (!segments?.length) {
      return NextResponse.json({ error: "no_captions" })
    }

    const transcript = segments
      .map((s) => s.text.replace(/\n/g, " ").trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    // Get video title from YouTube page
    let title = ""
    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9" },
        signal: AbortSignal.timeout(5000),
      })
      const html = await pageRes.text()
      const titleMatch = html.match(/<title>([^<]+)<\/title>/)
      title = (titleMatch?.[1] ?? "").replace(" - YouTube", "").trim()
    } catch {
      // title is optional, continue without it
    }

    return NextResponse.json({
      text: transcript.slice(0, 3000),
      title,
      videoId,
    })
  } catch (e) {
    console.error("fetch-youtube error:", e)
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 })
  }
}
