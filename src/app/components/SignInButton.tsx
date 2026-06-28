"use client"
import { signIn, signOut, useSession } from "next-auth/react"

export function SignInButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden sm:inline text-sm text-zinc-400 truncate max-w-[160px]">{session.user?.email}</span>
        <button
          onClick={() => signOut()}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm transition whitespace-nowrap"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn()}
      className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm transition whitespace-nowrap"
    >
      Sign In
    </button>
  )
}