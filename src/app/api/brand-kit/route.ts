import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  if (!email) return NextResponse.json({ error: "no_email" }, { status: 400 })

  const { data } = await supabase
    .from("user_settings")
    .select("brand_color, accent_color")
    .eq("email", email)
    .single()

  return NextResponse.json({ brandColor: data?.brand_color ?? null, accentColor: data?.accent_color ?? null })
}

export async function POST(req: Request) {
  const { email, brandColor, accentColor } = await req.json()
  if (!email) return NextResponse.json({ error: "no_email" }, { status: 400 })

  await supabase
    .from("user_settings")
    .upsert({ email, brand_color: brandColor, accent_color: accentColor, updated_at: new Date().toISOString() }, { onConflict: "email" })

  return NextResponse.json({ ok: true })
}
