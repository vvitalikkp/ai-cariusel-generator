import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  if (!email) return NextResponse.json({ error: "no_email" }, { status: 400 })

  const { data } = await supabase
    .from("user_settings")
    .select("brand_color, accent_color, logo_url, font_family, user_name, user_avatar")
    .eq("email", email)
    .single()

  return NextResponse.json({
    brandColor: data?.brand_color ?? null,
    accentColor: data?.accent_color ?? null,
    logoUrl: data?.logo_url ?? null,
    fontFamily: data?.font_family ?? null,
    userName: data?.user_name ?? null,
    userAvatar: data?.user_avatar ?? null,
  })
}

export async function POST(req: Request) {
  const { email, brandColor, accentColor, logoUrl, fontFamily, userName, userAvatar } = await req.json()
  if (!email) return NextResponse.json({ error: "no_email" }, { status: 400 })

  await supabase
    .from("user_settings")
    .upsert({
      email,
      brand_color: brandColor,
      accent_color: accentColor,
      logo_url: logoUrl ?? null,
      font_family: fontFamily ?? null,
      user_name: userName ?? null,
      user_avatar: userAvatar ?? null,
      updated_at: new Date().toISOString()
    }, { onConflict: "email" })

  return NextResponse.json({ ok: true })
}
