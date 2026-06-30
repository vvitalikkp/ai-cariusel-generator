"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const TOTAL_SPOTS = 500;

const FEATURES = [
  "Unlimited carousel generations — no monthly cap",
  "11 premium templates (more added regularly)",
  "4 AI tone presets: Storytelling, Authority, Contrarian, Data-Driven",
  "Export as PNG (ZIP) — post-ready, high resolution",
  "Export as PDF — LinkedIn document carousel format",
  "LinkedIn Post generator — AI writes the caption too",
  "Idea Bank — 15 curated prompts across 5 categories",
  "Import from URL — paste any article or blog post",
  "All future features included",
  "No subscription. No renewal. Ever.",
];

const FAQ = [
  {
    q: "Is this really one-time? No hidden renewals?",
    a: "Yes. You pay $59 once and own Pro access forever. No subscription, no auto-renewal, no surprises.",
  },
  {
    q: "Do future features get included?",
    a: "Yes. Everything added to CarouselAI Pro in the future is included in your lifetime license at no extra cost.",
  },
  {
    q: "How many licenses are available?",
    a: `Only ${TOTAL_SPOTS} lifetime licenses will ever be sold at this price. After that, Pro is subscription-only at $24/month.`,
  },
  {
    q: "How do I access Pro after purchase?",
    a: "Sign in with the same email you used at checkout (Google or GitHub). Your account upgrades automatically within seconds.",
  },
  {
    q: "What if I need a refund?",
    a: "If CarouselAI doesn't work for you in the first 14 days, reply to your purchase email and we'll refund you in full.",
  },
];

export default function LtdPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [soldCount, setSoldCount] = useState(0);
  const spotsLeft = TOTAL_SPOTS - soldCount;
  const soldOut = spotsLeft <= 0;

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    fetch("/api/ltd-count")
      .then((r) => r.json())
      .then((d) => setSoldCount(d.sold ?? 0))
      .catch(() => {});
  }, []);

  async function handleBuy() {
    if (!session?.user?.email) {
      signIn();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, plan: "ltd" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-5xl mx-auto">
        <Link href="/" className="text-lg font-black tracking-tight">CarouselAI</Link>
        <Link href="/create" className="text-sm text-zinc-400 hover:text-white transition">
          Try free →
        </Link>
      </nav>

      {/* Success / canceled banners */}
      {success && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4 text-green-400 text-sm font-medium">
            Payment successful — your lifetime license is active. Sign in to start creating.
          </div>
        </div>
      )}
      {canceled && (
        <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-6 py-4 text-zinc-400 text-sm">
            Purchase canceled. Your card was not charged.
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-full px-4 py-1.5 text-fuchsia-300 text-xs font-bold uppercase tracking-widest mb-8">
          Lifetime Deal — Limited to {TOTAL_SPOTS} licenses
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
          Own CarouselAI Pro.<br />
          <span className="text-fuchsia-400">Forever.</span>
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
          One payment. No subscription. All Pro features, including every update we ship — permanently unlocked.
        </p>

        {/* Pricing block */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 mb-6 max-w-sm mx-auto">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-zinc-500 line-through text-xl">$288/yr</span>
            <span className="text-5xl font-black">$59</span>
          </div>
          <p className="text-zinc-500 text-sm mb-6">one-time payment · no renewal</p>

          <button
            onClick={handleBuy}
            disabled={loading || soldOut}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition"
          >
            {soldOut ? "Sold Out" : loading ? "Redirecting..." : "Get Lifetime Access →"}
          </button>

          <p className="text-zinc-500 text-xs mt-3">
            {soldOut ? "All 500 lifetime licenses have been claimed." : "14-day money-back guarantee · Secure checkout via Stripe"}
          </p>
        </div>

        {/* Spots remaining */}
        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex-1 max-w-[200px] bg-zinc-800 rounded-full h-2">
            <div
              className="bg-fuchsia-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((soldCount / TOTAL_SPOTS) * 100, 100)}%` }}
            />
          </div>
          <span className="text-zinc-400">
            {soldOut
              ? <span className="text-red-400 font-bold">Sold out</span>
              : <><span className="text-white font-bold">{spotsLeft}</span> of {TOTAL_SPOTS} spots remaining</>
            }
          </span>
        </div>
      </section>

      {/* Vs subscription comparison */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 opacity-60">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Pro Monthly</p>
            <p className="text-3xl font-black mb-1">$24<span className="text-base font-normal text-zinc-500">/mo</span></p>
            <p className="text-zinc-500 text-sm mb-4">= $288/year</p>
            <p className="text-zinc-500 text-sm">Recurring charge every month. Cancel anytime, lose access immediately.</p>
          </div>
          <div className="bg-fuchsia-900/20 border-2 border-fuchsia-500/60 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              BEST VALUE
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-4">Lifetime Deal</p>
            <p className="text-3xl font-black mb-1">$59<span className="text-base font-normal text-zinc-400"> once</span></p>
            <p className="text-zinc-400 text-sm mb-4">= $0/year after that</p>
            <p className="text-zinc-300 text-sm">Pay once, use forever. Every future feature included. No renewal risk.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h2 className="text-2xl font-black mb-8 text-center">Everything in Pro, forever</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3 bg-zinc-900/50 rounded-xl px-4 py-3">
              <span className="text-fuchsia-400 mt-0.5 text-lg leading-none">✓</span>
              <span className="text-zinc-300 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-8 py-12">
        <h2 className="text-2xl font-black mb-8 text-center">FAQ</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5">
              <p className="font-bold text-white mb-2">{q}</p>
              <p className="text-zinc-400 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-8 py-12 text-center">
        <h2 className="text-3xl font-black mb-4">
          {soldOut ? "All licenses claimed." : "Stop paying monthly. Own it."}
        </h2>
        <p className="text-zinc-400 mb-8">
          {soldOut
            ? "The lifetime deal is no longer available. Pro is $24/month."
            : `${spotsLeft} spots left at $59. After that, Pro is $24/month.`}
        </p>
        {soldOut ? (
          <a href="/#pricing" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition inline-block">
            See Pro subscription →
          </a>
        ) : (
          <button
            onClick={handleBuy}
            disabled={loading}
            className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-60 text-white font-bold px-10 py-4 rounded-xl text-lg transition"
          >
            {loading ? "Redirecting..." : "Get Lifetime Access — $59"}
          </button>
        )}
        <p className="text-zinc-600 text-xs mt-4">14-day refund guarantee · Stripe checkout</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-zinc-600 text-sm">
        <Link href="/" className="hover:text-white transition mr-4">Home</Link>
        <Link href="/create" className="hover:text-white transition mr-4">Try free</Link>
        <Link href="/privacy" className="hover:text-white transition mr-4">Privacy</Link>
        <Link href="/terms" className="hover:text-white transition">Terms</Link>
      </footer>
    </div>
  );
}
