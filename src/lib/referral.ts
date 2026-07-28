// Deterministic, dependency-free referral code derived from an email address.
// Not cryptographically secure and not meant to be — worst case someone
// guesses another user's code and "refers" themselves through it, which just
// credits that other user +3 free generations. Low stakes, so a simple
// synchronous hash (usable both client- and server-side with no extra
// network round trip) is the right tradeoff over crypto.subtle.

export function getReferralCode(email: string): string {
  const normalized = email.trim().toLowerCase()
  // FNV-1a 32-bit
  let hash = 0x811c9dc5
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

export function referralLink(email: string): string {
  return `https://www.aicarousel.tech/create?ref=${getReferralCode(email)}`
}
