"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { SignInButton } from "../components/SignInButton";

interface Stats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  ltdCount: number;
  proMonthlyCount: number;
  proAnnualCount: number;
  generationsThisMonth: number;
  conversionRate: number;
  stripe: {
    allTimeRevenue: number;
    last30dRevenue: number;
    chargeCount: number;
    mrr: number;
    activeSubCount: number;
  } | null;
  estimatedLtdRevenue: number;
  estimatedMrr: number;
}

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">{label}</p>
      <p className="text-3xl font-black">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Admin() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/stats")
      .then(async (r) => {
        if (r.status === 403) {
          setForbidden(true);
          setLoading(false);
          return;
        }
        const data = await r.json();
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        setErrorMsg(String(e));
        setLoading(false);
      });
  }, [status]);

  if (status === "loading") {
    return <main className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</main>;
  }

  if (status !== "authenticated") {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
        <p className="text-zinc-400">Sign in with your admin account to view this page.</p>
        <button onClick={() => signIn()} className="bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-lg font-semibold transition">
          Sign In
        </button>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">
          Signed in as {session?.user?.email}, but this account isn&apos;t on the admin allowlist.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-fuchsia-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-fuchsia-900/8 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto gap-2">
        <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap">
          <svg width="20" height="20" viewBox="0 0 88 88" fill="none" aria-hidden="true"><path d="M64 20H30L18 44L30 68H64V54H40L34 44L40 34H64V20Z" fill="#d946ef"/></svg>
          CarouselAI <span className="text-zinc-600 font-normal ml-1">/ admin</span>
        </Link>
        <SignInButton />
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        {loading && <p className="text-zinc-500">Loading stats…</p>}
        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

        {stats && (
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-bold mb-4">Revenue {stats.stripe ? "(live, Stripe)" : "(estimated — Stripe unavailable)"}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                  label="MRR"
                  value={money(stats.stripe ? stats.stripe.mrr : stats.estimatedMrr)}
                  sub={stats.stripe ? `${stats.stripe.activeSubCount} active subscriptions` : "estimated from plan labels"}
                />
                <Card
                  label="All-time revenue"
                  value={stats.stripe ? money(stats.stripe.allTimeRevenue) : money(stats.estimatedLtdRevenue)}
                  sub={stats.stripe ? `${stats.stripe.chargeCount} successful charges (last 100)` : "LTD only, estimated"}
                />
                <Card
                  label="Last 30 days"
                  value={stats.stripe ? money(stats.stripe.last30dRevenue) : "—"}
                />
                <Card
                  label="LTD sold"
                  value={String(stats.ltdCount)}
                  sub={`${money(stats.ltdCount * 59)} at $59 each`}
                />
              </div>
            </div>

            <div>
              <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-bold mb-4">Users</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total users" value={String(stats.totalUsers)} />
                <Card label="Free" value={String(stats.freeUsers)} />
                <Card label="Paid" value={String(stats.proUsers)} sub={`${stats.conversionRate.toFixed(1)}% conversion`} />
                <Card label="Pro subs" value={String(stats.proMonthlyCount + stats.proAnnualCount)} sub={`${stats.proMonthlyCount} monthly, ${stats.proAnnualCount} annual`} />
              </div>
            </div>

            <div>
              <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-bold mb-4">Usage</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Carousels generated this month" value={String(stats.generationsThisMonth)} />
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              Revenue numbers pull live from Stripe (last 100 charges + active subscriptions) when the API key is available; otherwise falls back to an estimate from the plan label stored in Supabase. Stripe Dashboard remains the source of truth for anything beyond this — refunds, disputes, full history.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
