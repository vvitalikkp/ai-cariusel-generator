import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const { data } = await supabase
    .from("generation_counts")
    .select("count")

  const total = (data ?? []).reduce((sum, row) => sum + (row.count ?? 0), 0)

  return NextResponse.json({ total })
}
