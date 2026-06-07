"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export function SignInButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">{session.user?.email}</span>
        <button
          onClick={() => signOut()}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn()}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition"
    >
      Sign In
    </button>
  )
}