import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { FREE_LIMIT, monthlyCountFromRow, effectiveFreeLimit } from "@/lib/limits"

export async function POST() {
  try {
    // Identity comes from the server-verified session, never from the
    // request body — otherwise anyone could POST an arbitrary email and
    // learn whether that person is a paying customer.
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
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
