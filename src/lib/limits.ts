export const FREE_LIMIT = 3

export function monthlyCountFromRow(row: { count?: number; updated_at?: string } | null | undefined): number {
  const lastUpdate = row?.updated_at ? new Date(row.updated_at) : null
  const now = new Date()
  const sameMonth = !!lastUpdate &&
    lastUpdate.getUTCFullYear() === now.getUTCFullYear() &&
    lastUpdate.getUTCMonth() === now.getUTCMonth()
  return sameMonth ? (row?.count || 0) : 0
}
