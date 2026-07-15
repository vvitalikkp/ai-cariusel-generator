import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import Stripe from "stripe"
import { authOptions, isAdminEmail } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { monthlyCountFromRow } from "@/lib/limits"

export const dynamic = "force-dynamic"

type Row = {
  email: string
  is_pro: boolean | null
  plan: string | null
  count: number | null
  updated_at: string | null
}

async function getStripeRevenue() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null

  const stripe = new Stripe(secretKey)

  let allTimeRevenueCents = 0
  let last30dRevenueCents = 0
  let chargeCount = 0
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60

  for await (const charge of stripe.charges.list({ limit: 100 })) {
    if (charge.status !== "succeeded" || charge.refunded) continue
    allTimeRevenueCents += charge.amount
    chargeCount += 1
    if (charge.created >= thirtyDaysAgo) last30dRevenueCents += charge.amount
  }

  let mrrCents = 0
  let activeSubCount = 0
  for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 })) {
    activeSubCount += 1
    for (const item of sub.items.data) {
      const amount = item.price?.unit_amount ?? 0
      const interval = item.price?.recurring?.interval
      const monthly = interval === "year" ? amount / 12 : amount
      mrrCents += monthly * (item.quantity ?? 1)
    }
  }

  return {
    allTimeRevenue: allTimeRevenueCents / 100,
    last30dRevenue: last30dRevenueCents / 100,
    chargeCount,
    mrr: mrrCents / 100,
    activeSubCount,
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "not_authorized" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("generation_counts")
    .select("email, is_pro, plan, count, updated_at")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data || []) as Row[]

  const totalUsers = rows.length
  const proUsers = rows.filter((r) => r.is_pro).length
  const freeUsers = totalUsers - proUsers
  const ltdCount = rows.filter((r) => r.plan === "ltd").length
  const proMonthlyCount = rows.filter((r) => r.plan === "pro_monthly").length
  const proAnnualCount = rows.filter((r) => r.plan === "pro_annual").length

  const generationsThisMonth = rows.reduce((sum, r) => sum + monthlyCountFromRow(r), 0)

  let stripe = null
  try {
    stripe = await getStripeRevenue()
  } catch (e) {
    console.error("Stripe fetch failed:", e)
  }

  return NextResponse.json({
    totalUsers,
    freeUsers,
    proUsers,
    ltdCount,
    proMonthlyCount,
    proAnnualCount,
    generationsThisMonth,
    conversionRate: totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0,
    stripe,
    // Fallback estimate from Supabase plan labels alone, used only if the
    // live Stripe call above fails (e.g. missing/rotated key) — not a
    // substitute for Stripe, just keeps the dashboard from going blank.
    estimatedLtdRevenue: ltdCount * 59,
    estimatedMrr: proMonthlyCount * 24 + proAnnualCount * 19,
  })
}
