import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ isPro: false })

    const { data } = await supabase
      .from("generation_counts")
      .select("is_pro")
      .eq("email", email)
      .single()

    return NextResponse.json({ isPro: data?.is_pro || false })
  } catch (e) {
    return NextResponse.json({ isPro: false })
  }
}