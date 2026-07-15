export const FREE_LIMIT = 3

// Fair-use cap for paid (Pro + LTD) accounts. Not a marketing number — this
// exists purely to protect unit economics on the "unlimited" LTD plan, since
// every generation is a paid GPT-4o call. 50/day is far above real usage
// (even a very active creator posts a handful of carousels a day) so it
// should never be visible to a legitimate user.
export const DAILY_FAIR_USE_LIMIT = 50

export function monthlyCountFromRow(row: { count?: number; updated_at?: string } | null | undefined): number {
  const lastUpdate = row?.updated_at ? new Date(row.updated_at) : null
  const now = new Date()
  const sameMonth = !!lastUpdate &&
    lastUpdate.getUTCFullYear() === now.getUTCFullYear() &&
    lastUpdate.getUTCMonth() === now.getUTCMonth()
  return sameMonth ? (row?.count || 0) : 0
}

export function dailyCountFromRow(row: { daily_count?: number; daily_updated_at?: string } | null | undefined): number {
  const lastUpdate = row?.daily_updated_at ? new Date(row.daily_updated_at) : null
  const now = new Date()
  const sameDay = !!lastUpdate &&
    lastUpdate.getUTCFullYear() === now.getUTCFullYear() &&
    lastUpdate.getUTCMonth() === now.getUTCMonth() &&
    lastUpdate.getUTCDate() === now.getUTCDate()
  return sameDay ? (row?.daily_count || 0) : 0
}
