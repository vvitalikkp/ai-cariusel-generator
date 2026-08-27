import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// Identity comes from the server-verified session on both GET and POST,
// never from a client-supplied email. Previously any caller could read or
// overwrite anyone else's brand kit (logo, colors, font, name) just by
// knowing their email address — this closes that.

export async function GET() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign_in_required" }, { status: 401 })

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
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "sign_in_required" }, { status: 401 })

  const { brandColor, accentColor, logoUrl, fontFamily, userName, userAvatar } = await req.json()

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
