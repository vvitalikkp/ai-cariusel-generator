"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignInButton } from "./components/SignInButton";
import { TEMPLATES, SHOWCASE_EXAMPLES } from "@/lib/templates";

export default function Home() {
  const [isPro, setIsPro] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    async function checkPro() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch("/api/check-pro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();
        setIsPro(data.isPro || false);
      } catch (e) {
        console.error(e);
      }
    }
    checkPro();
  }, [session]);

  async function handleUpgrade(plan: "pro_monthly" | "pro_annual" = "pro_monthly") {
    if (!session?.user?.email) {
      alert("Please sign in first to upgrade");
      return;
    }
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session?.user?.email, plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Error: " + JSON.stringify(data));
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[140px]" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-xl font-black tracking-tight">CarouselAI</div>
        <div className="flex items-center gap-8 text-sm text-zinc-400">
          <a href="#how-it-works" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          {isPro && <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold">PRO</span>}
          <SignInButton />
          <Link href="/create" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition">
            Create Carousel →
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="mb-6 inline-block px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-sm">
              AI-powered LinkedIn Growth
            </div>
            <h1 className="text-6xl font-black leading-tight mb-6 tracking-tight">
              Create Viral<br />LinkedIn Carousels<br />with AI
            </h1>
            <p className="text-zinc-400 text-xl mb-6 max-w-xl">
              Paste a tweet, an idea, or an article. Get a polished 6-slide carousel — hook, structure, and design handled by AI.
            </p>
            <div className="flex flex-col gap-2 mb-8 text-sm text-zinc-300">
              <span className="flex items-center gap-2"><span className="text-green-400">✓</span> 11 premium templates, 4 AI tone presets</span>
              <span className="flex items-center gap-2"><span className="text-green-400">✓</span> Export to PNG or PDF in one click</span>
              <span className="flex items-center gap-2"><span className="text-green-400">✓</span> Free to try, no credit card required</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/create"
                className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 transition-all font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)] inline-block"
              >
                Create Your Carousel ✦
              </Link>
              <a href="#showcase" className="text-zinc-400 hover:text-white text-sm transition">See examples ↓</a>
            </div>
          </div>

          <div className="relative h-[480px] hidden lg:block">
            {[SHOWCASE_EXAMPLES[2], SHOWCASE_EXAMPLES[0]].map((ex, i) => {
              const et = TEMPLATES[ex.style];
              return (
                <div
                  key={i}
                  className={`absolute rounded-[28px] overflow-hidden shadow-2xl ${et.card}`}
                  style={{
                    width: 280,
                    aspectRatio: "4/5",
                    top: i === 0 ? 0 : 70,
                    left: i === 0 ? 40 : 200,
                    transform: i === 0 ? "rotate(-4deg)" : "rotate(3deg)",
                    zIndex: i,
                  }}
                >
                  <div className="relative z-10 flex flex-col h-full p-7">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${et.isLight ? "text-black/30" : "text-white/30"}`}>
                        {ex.style}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${et.dot}`} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-3">
                      <p className={`leading-tight ${et.title}`}>{ex.title}</p>
                      <p className={`leading-relaxed text-xs ${et.desc}`}>{ex.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="showcase" className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-purple-400 text-sm uppercase tracking-[0.3em] mb-4">Showcase</p>
          <h2 className="text-4xl font-black mb-4">See what creators generate</h2>
          <p className="text-zinc-500">Real templates, real output — not mockups</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {SHOWCASE_EXAMPLES.map((ex, i) => {
            const et = TEMPLATES[ex.style];
            return (
              <div
                key={i}
                className={`relative rounded-[24px] overflow-hidden ${et.card}`}
                style={{ aspectRatio: "4/5" }}
              >
                <div className="relative z-10 flex flex-col h-full p-7">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${et.isLight ? "text-black/30" : "text-white/30"}`}>
                      {ex.style}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${et.dot}`} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-3">
                    <p className={`leading-tight ${et.title}`}>{ex.title}</p>
                    <p className={`leading-relaxed text-xs ${et.desc}`}>{ex.desc}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide self-end px-2 py-1 rounded-full ${et.isLight ? "bg-black/5 text-black/50" : "bg-white/10 text-white/50"}`}>
                    Made with CarouselAI
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link href="/create" className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 transition font-bold inline-block">
            Try it yourself →
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 max-w-4xl mx-auto py-20 px-6">
        <div className="text-center mb-16">
          <p className="text-purple-400 uppercase tracking-[0.3em] text-sm mb-4">How it works</p>
          <h2 className="text-4xl font-black mb-4">3 steps to viral content</h2>
          <p className="text-zinc-400">From idea to LinkedIn carousel in seconds</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[28px]">
            <div className="text-5xl font-black text-purple-400 mb-4">01</div>
            <h3 className="text-xl font-bold mb-3">Paste your content</h3>
            <p className="text-zinc-400 text-sm">Paste any text, tweet, article or just type your idea</p>
          </div>
          <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[28px]">
            <div className="text-5xl font-black text-purple-400 mb-4">02</div>
            <h3 className="text-xl font-bold mb-3">AI generates slides</h3>
            <p className="text-zinc-400 text-sm">AI creates Hook, Problem, Solution, CTA structure automatically</p>
          </div>
          <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[28px]">
            <div className="text-5xl font-black text-purple-400 mb-4">03</div>
            <h3 className="text-xl font-bold mb-3">Export & post</h3>
            <p className="text-zinc-400 text-sm">Download PNG or PDF and post directly to LinkedIn</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 max-w-6xl mx-auto py-32 px-6">
        <div className="text-center mb-16">
          <p className="text-pink-400 uppercase tracking-[0.3em] text-sm mb-4">Pricing</p>
          <h2 className="text-5xl font-black mb-4">Simple pricing<br />for creators</h2>
          <p className="text-zinc-400">Start free. Upgrade when you&apos;re ready to remove the watermark.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl flex flex-col">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-zinc-500 text-sm mb-6">Try it out every month</p>
            <p className="text-5xl font-black mb-1">$0</p>
            <p className="text-zinc-600 text-sm mb-8">forever</p>
            <ul className="space-y-3 text-zinc-300 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 3 carousels / month</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> PNG export</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All templates &amp; tones</li>
              <li className="flex items-center gap-2 text-zinc-600"><span>✗</span> PDF export</li>
              <li className="flex items-center gap-2 text-zinc-600"><span>✗</span> Watermark removal</li>
            </ul>
            <Link href="/create" className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition font-bold text-center">Start Free</Link>
          </div>

          <div className="relative bg-gradient-to-br from-fuchsia-600/30 to-purple-600/20 border border-fuchsia-500/40 rounded-[32px] p-8 shadow-[0_0_60px_rgba(217,70,239,0.25)] flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">BEST VALUE</div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <p className="text-zinc-400 text-sm mb-6">For creators who post often</p>
            <div className="flex items-end gap-1 mb-1">
              <p className="text-5xl font-black">$24</p>
              <p className="text-zinc-400 text-sm mb-2">/month</p>
            </div>
            <p className="text-zinc-400 text-sm mb-8">or $19/mo billed annually</p>
            <ul className="space-y-3 text-zinc-200 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited carousels</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> PNG + PDF export</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All templates &amp; tones</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> LinkedIn Post generator</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> No watermark</li>
            </ul>
            <button onClick={() => handleUpgrade("pro_monthly")} className="w-full py-4 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 transition font-bold shadow-[0_0_30px_rgba(217,70,239,0.4)] mb-2">Get Pro — $24/mo</button>
            <button onClick={() => handleUpgrade("pro_annual")} className="w-full py-2 text-sm text-fuchsia-300 hover:text-fuchsia-200 transition">Get annual — $19/mo billed yearly</button>
          </div>
        </div>
        <p className="text-center text-zinc-600 text-sm mt-10">🔒 Secure payment via Stripe · Cancel anytime</p>
      </section>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <span>© 2026 CarouselAI</span>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <a href="mailto:22vp222.0@gmail.com" className="hover:text-white transition">Contact</a>
        </div>
      </footer>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-green-500/30 rounded-[32px] p-10 max-w-md text-center mx-4">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-black mb-3">Welcome to Pro!</h2>
            <p className="text-zinc-400 mb-8">Your account has been upgraded. Enjoy unlimited carousels and PDF export!</p>
            <Link href="/create" onClick={() => setShowSuccess(false)} className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 transition font-bold text-lg inline-block">Start Creating 🚀</Link>
          </div>
        </div>
      )}

    </main>
  );
}
