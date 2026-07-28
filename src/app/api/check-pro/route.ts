import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { FREE_LIMIT, monthlyCountFromRow, effectiveFreeLimit } from "@/lib/limits"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ isPro: false, used: 0, limit: FREE_LIMIT })

    const { data } = await supabase
      .from("generation_counts")
      .select("is_pro, count, updated_at, bonus_generations")
      .eq("email", email)
      .single()

    return NextResponse.json({
      isPro: data?.is_pro || false,
      used: monthlyCountFromRow(data),
      limit: effectiveFreeLimit(data),
    })
  } catch (e) {
    return NextResponse.json({ isPro: false, used: 0, limit: FREE_LIMIT })
  }
}
