export const FREE_LIMIT = 3

// Fair-use cap for paid (Pro + LTD) accounts. Not a marketing number — this
// exists purely to protect unit economics on the "unlimited" LTD plan, since
// every generation is a paid GPT-4o call. 50/day is far above real usage
// (even a very active creator posts a handful of carousels a day) so it
// should never be visible to a legitimate user.
export const DAILY_FAIR_USE_LIMIT = 50

// Referral bonus: each successful referral permanently raises the referrer's
// free monthly cap by this many carousels (on top of FREE_LIMIT). It's a
// standing increase to the cap, not a spendable one-off credit pool — simpler
// to reason about and to display ("you get 3 free/mo + 3 per friend you
// invite" is one sentence, no separate balance to track or expire).
export const REFERRAL_BONUS = 3

export function monthlyCountFromRow(row: { count?: number | null; updated_at?: string | null } | null | undefined): number {
  const lastUpdate = row?.updated_at ? new Date(row.updated_at) : null
  const now = new Date()
  const sameMonth = !!lastUpdate &&
    lastUpdate.getUTCFullYear() === now.getUTCFullYear() &&
    lastUpdate.getUTCMonth() === now.getUTCMonth()
  return sameMonth ? (row?.count || 0) : 0
}

export function dailyCountFromRow(row: { daily_count?: number | null; daily_updated_at?: string | null } | null | undefined): number {
  const lastUpdate = row?.daily_updated_at ? new Date(row.daily_updated_at) : null
  const now = new Date()
  const sameDay = !!lastUpdate &&
    lastUpdate.getUTCFullYear() === now.getUTCFullYear() &&
    lastUpdate.getUTCMonth() === now.getUTCMonth() &&
    lastUpdate.getUTCDate() === now.getUTCDate()
  return sameDay ? (row?.daily_count || 0) : 0
}

export function effectiveFreeLimit(row: { bonus_generations?: number | null } | null | undefined): number {
  return FREE_LIMIT + (row?.bonus_generations || 0)
}
