import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const { count } = await supabase
    .from("generation_counts")
    .select("*", { count: "exact", head: true })
    .eq("plan", "ltd")

  return NextResponse.json({ sold: count ?? 0 })
}
