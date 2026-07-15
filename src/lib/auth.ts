import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
}

// Emails allowed to view /admin and /api/admin/*. Set ADMIN_EMAILS as a
// comma-separated env var on Vercel to override; falls back to the owner's
// email so it works out of the box.
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const allowlist = (process.env.ADMIN_EMAILS || "22vp222.0@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowlist.includes(email.toLowerCase())
}
