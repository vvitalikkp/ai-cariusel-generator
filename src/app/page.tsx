"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SignInButton } from "./components/SignInButton"
import jsPDF from "jspdf";

const TEMPLATES = {
  Viral: {
    card: "bg-black border border-purple-500/40",
    title: "text-white font-black text-3xl tracking-tight",
    desc: "text-zinc-400",
    dot: "bg-pink-400 shadow-[0_0_12px_#f472b6]",
    num: "text-purple-300",
  },
  Storytelling: {
    card: "bg-gradient-to-br from-fuchsia-900/40 to-black border border-fuchsia-500/30",
    title: "text-white font-black text-3xl italic",
    desc: "text-zinc-300",
    dot: "bg-pink-400 shadow-[0_0_12px_#f472b6]",
    num: "text-fuchsia-300",
  },
  Minimal: {
    card: "bg-zinc-950 border border-white/10",
    title: "text-white font-bold text-3xl",
    desc: "text-zinc-500",
    dot: "bg-white",
    num: "text-zinc-500",
  },
  Corporate: {
    card: "bg-blue-950 border border-blue-400/20",
    title: "text-white font-extrabold text-3xl uppercase",
    desc: "text-blue-100",
    dot: "bg-cyan-400 shadow-[0_0_12px_#22d3ee]",
    num: "text-cyan-300",
  },
  Light: {
    card: "bg-white border border-gray-100",
    title: "text-gray-900 font-black text-3xl tracking-tight",
    desc: "text-gray-500",
    dot: "bg-purple-500",
    num: "text-gray-300",
  },
  Gradient: {
    card: "bg-gradient-to-br from-violet-600 to-indigo-600 border-0",
    title: "text-white font-black text-3xl",
    desc: "text-white/70",
    dot: "bg-yellow-300 shadow-[0_0_12px_#fde047]",
    num: "text-white/30",
  },
  Bold: {
    card: "bg-yellow-400 border-0",
    title: "text-black font-black text-3xl uppercase tracking-tighter",
    desc: "text-black/60",
    dot: "bg-black",
    num: "text-black/20",
  },
  Neon: {
    card: "bg-black border border-green-400/30",
    title: "text-green-400 font-black text-3xl",
    desc: "text-green-200/60",
    dot: "bg-green-400 shadow-[0_0_12px_#4ade80]",
    num: "text-green-900",
  },
} as const;

type TemplateKey = keyof typeof TEMPLATES;

interface Slide {
  title: string;
  description: string;
  type: string;
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState<TemplateKey>("Viral");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkedInPost, setLinkedInPost] = useState("")
  const [loadingPost, setLoadingPost] = useState(false)
  const [cardColor, setCardColor] = useState("#2d1b69")
  const [cardFont, setCardFont] = useState("font-sans")
  const [userName, setUserName] = useState("CarouselAI")
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const t = TEMPLATES[style];
  const { data: session } = useSession();

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get("success") === "true") {
    setShowSuccess(true)
    window.history.replaceState({}, "", "/")
  }
}, [])

  useEffect(() => {
    async function checkPro() {
      if (!session?.user?.email) return
      try {
        const res = await fetch("/api/check-pro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        })
        const data = await res.json()
        setIsPro(data.isPro || false)
      } catch (e) {
        console.error(e)
      }
    }
    checkPro()
  }, [session])

  async function generateSlides() {
    if (!idea.trim()) return;
    setLoading(true);
    setSlides([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, style, email: session?.user?.email }),
      });
      const data = await res.json();
      if (data.error === "limit_reached") {
        setShowPaywall(true);
        setLoading(false);
        return;
      }
      setSlides(data.slides || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function updateSlide(index: number, field: "title" | "description", value: string) {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function regenerateSlide(index: number) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, style }),
      });
      const data = await res.json();
      if (data.slides?.length > 0) {
        const newSlide = data.slides[index] || data.slides[0];
        setSlides((prev) => {
          const next = [...prev];
          next[index] = newSlide;
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function generateLinkedInPost() {
    setLoadingPost(true)
    try {
      const slidesText = slides.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join("\n")
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: `Write a LinkedIn post (max 200 words) to introduce this carousel about: ${idea}. Slides: ${slidesText}. Include hook, value, and CTA. Add relevant emojis.`,
          style
        }),
      })
      const data = await res.json()
      if (data.slides?.[0]?.title) {
        setLinkedInPost(data.slides[0].title + "\n\n" + data.slides[0].description)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingPost(false)
  }

 async function handleUpgrade(plan: "pro" | "pro_plus" = "pro") {
  if (!session?.user?.email) {
    alert("Please sign in first to upgrade")
    return
  }
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: session?.user?.email, plan }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else alert("Error: " + JSON.stringify(data))
}



  async function downloadPNG() {
    const zip = new JSZip();
    for (let i = 0; i < slides.length; i++) {
      const el = document.getElementById(`slide-${i}`);
      if (!el) continue;
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#000" });
      const blob = await (await fetch(dataUrl)).blob();
      zip.file(`slide-${i + 1}.png`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "carousel.zip");
  }

  async function downloadPDF() {
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    const firstEl = document.getElementById(`slide-0`);
    if (!firstEl) return;
    const w = firstEl.offsetWidth;
    const h = firstEl.offsetHeight;
    const pdf = new jsPDF({
      orientation: w > h ? "landscape" : "portrait",
      unit: "px",
      format: [w, h],
    });
    for (let i = 0; i < slides.length; i++) {
      const el = document.getElementById(`slide-${i}`);
      if (!el) continue;
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#000000" });
      if (i > 0) pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
    }
    pdf.save("carousel.pdf");
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
          <button className="hover:text-white transition">Features</button>
          <button className="hover:text-white transition">Pricing</button>
          <button className="hover:text-white transition">Github</button>
          {isPro && <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold">PRO</span>}
          <SignInButton />
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="mb-6 inline-block px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-sm">
              AI-powered LinkedIn Growth
            </div>
            <h1 className="text-6xl font-black leading-tight mb-6 tracking-tight">
              Create Viral<br />LinkedIn Carousels<br />with AI
            </h1>
            <p className="text-zinc-400 text-xl mb-4 max-w-xl">
              Generate beautiful carousel posts, hooks, and viral content in seconds.
            </p>
            <p className="text-sm text-zinc-500">Trusted by 2,000+ creators & marketers</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3 flex-wrap">
              {(Object.keys(TEMPLATES) as TemplateKey[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setStyle(item)}
                  className={`px-5 py-2 rounded-full border transition-all duration-200 text-sm ${
                    style === item
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:border-purple-500/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <textarea
                placeholder="Paste your text, tweet, article or just an idea..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl outline-none text-base focus:border-purple-500 transition resize-none h-32"
              />
              <button
                onClick={generateSlides}
                disabled={loading || !idea.trim()}
                className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)] whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  "Generate ✦"
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {slides.length > 0 && (
        <section className="relative z-10 max-w-2xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-black mb-8 text-center">
            Your carousel — <span className="text-purple-400">{slides.length} slides</span>
          </h2>
          <div className="flex gap-2 justify-center mb-6 flex-wrap">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => document.getElementById(`slide-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-purple-500 transition text-xs font-bold text-white/60 hover:text-white border border-white/10"
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Color:</span>
              {["#2d1b69", "#1a3a2d", "#1a1a3e", "#3a1a1a", "#1a2a3a"].map((color) => (
                <button
                  key={color}
                  onClick={() => setCardColor(color)}
                  className="w-6 h-6 rounded-full border-2 border-transparent hover:border-white transition"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Font:</span>
              {["font-sans", "font-serif", "font-mono"].map((font) => (
                <button
                  key={font}
                  onClick={() => setCardFont(font)}
                  className={`text-xs px-3 py-1 rounded-full border border-white/20 hover:border-white transition ${cardFont === font ? "bg-white/20" : ""}`}
                >
                  {font.replace("font-", "")}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-zinc-400">Name:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-white/10 text-white text-sm px-3 py-1 rounded-full outline-none border border-white/20 w-32"
                placeholder="Your name"
              />
              <label className="cursor-pointer text-sm text-zinc-400 hover:text-white transition">
                Photo
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => setUserAvatar(reader.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="space-y-4">
            {slides.map((slide, i) => (
              <div
                key={i}
                id={`slide-${i}`}
                className="relative rounded-[28px] overflow-hidden"
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  background: i % 2 === 0
                    ? `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}99 50%, ${cardColor} 100%)`
                    : `linear-gradient(135deg, #0f0f1a 0%, ${cardColor}44 50%, #0f0f1a 100%)`,
                }}
              >
                <div className="relative z-10 flex flex-col h-full p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-purple-400">
                      {String(i + 1).padStart(2, "0")} / {slides.length.toString().padStart(2, "0")}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-5 py-8">
                    <textarea
                      value={slide.title}
                      onChange={(e) => updateSlide(i, "title", e.target.value)}
                      className={`w-full bg-transparent resize-none outline-none leading-tight ${t.title}`}
                      rows={3}
                    />
                    <textarea
                      value={slide.description}
                      onChange={(e) => updateSlide(i, "description", e.target.value)}
                      className={`w-full bg-transparent resize-none outline-none leading-relaxed text-base ${t.desc}`}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    {userAvatar ? (
                      <img src={userAvatar} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {userName[0]}
                      </div>
                    )}
                    <span className="text-xs text-white/40">{userName}</span>
                    <span className="ml-auto text-[10px] text-white/20 font-medium tracking-widest uppercase">CarouselAI</span>
                  </div>

                  <button
                    onClick={() => regenerateSlide(i)}
                    className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-white/40 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10"
                  >
                    regenerate
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
            <button onClick={downloadPNG} className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 transition font-bold">
              Download PNG (ZIP)
            </button>
            <button
              onClick={downloadPDF}
              className={`px-8 py-4 rounded-2xl transition font-bold flex items-center gap-2 ${isPro ? "bg-fuchsia-600 hover:bg-fuchsia-500" : "bg-white/10 border border-white/10 hover:bg-white/20"}`}
            >
              {!isPro && <span className="text-yellow-400">🔒</span>}
              Export PDF {!isPro && "(Pro)"}
            </button>
            <button
              onClick={() => {
                const text = slides.map((s, i) => `${i + 1}. ${s.title}\n${s.description}`).join("\n\n");
                navigator.clipboard.writeText(text);
              }}
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
            >
              Copy All Text
            </button>
            <button
              onClick={generateLinkedInPost}
              disabled={loadingPost}
              className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition font-bold disabled:opacity-50"
            >
              {loadingPost ? "Generating..." : "LinkedIn Post"}
            </button>
          </div>
          {linkedInPost && (
            <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-zinc-400">LinkedIn Post</span>
                <button onClick={() => navigator.clipboard.writeText(linkedInPost)} className="text-xs text-purple-400 hover:text-purple-300">
                  Copy
                </button>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{linkedInPost}</p>
            </div>
          )}
        </section>
      )}

      {!loading && slides.length === 0 && (
        <section className="relative z-10 max-w-2xl mx-auto px-6 pb-20 text-center">
          <p className="text-purple-400 text-sm uppercase tracking-[0.3em] mb-4">Showcase</p>
          <h2 className="text-4xl font-black mb-4">See what creators generate</h2>
          <p className="text-zinc-500">Enter a topic above and hit Generate</p>
        </section>
      )}

      <section className="relative z-10 max-w-4xl mx-auto py-20 px-6">
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

      <section className="relative z-10 max-w-5xl mx-auto py-20 px-6">
        <div className="text-center mb-12">
          <p className="text-purple-400 uppercase tracking-[0.3em] text-sm mb-4">Testimonials</p>
          <h2 className="text-4xl font-black mb-4">Creators love it</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
            <p className="text-zinc-300 text-sm mb-6">"I went from spending 2 hours on a carousel to 2 minutes. This tool is insane."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">A</div>
              <div><p className="font-bold text-sm">Alex K.</p><p className="text-zinc-500 text-xs">LinkedIn Creator, 45k followers</p></div>
            </div>
          </div>
          <div className="bg-white/5 border border-purple-500/30 rounded-[24px] p-6">
            <p className="text-zinc-300 text-sm mb-6">"The Hook to Problem to Solution structure is exactly what top LinkedIn posts use. Game changer."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-fuchsia-600 flex items-center justify-center font-bold">M</div>
              <div><p className="font-bold text-sm">Maria S.</p><p className="text-zinc-500 text-xs">Startup Founder</p></div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
            <p className="text-zinc-300 text-sm mb-6">"My engagement went up 3x after I started using AI carousels. Best $19 I ever spent."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold">D</div>
              <div><p className="font-bold text-sm">David N.</p><p className="text-zinc-500 text-xs">Marketing Director</p></div>
            </div>
          </div>
        </div>
      </section>

     <section className="relative z-10 max-w-6xl mx-auto py-32 px-6">
        <div className="text-center mb-16">
          <p className="text-pink-400 uppercase tracking-[0.3em] text-sm mb-4">Pricing</p>
          <h2 className="text-5xl font-black mb-4">Pay once.<br />Use forever.</h2>
          <p className="text-zinc-400">No subscriptions. No hidden fees. Upgrade when you're ready.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {/* FREE */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl flex flex-col">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-zinc-500 text-sm mb-6">Try before you buy</p>
            <p className="text-5xl font-black mb-1">$0</p>
            <p className="text-zinc-600 text-sm mb-8">forever</p>
            <ul className="space-y-3 text-zinc-300 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 3 carousels total</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> PNG export</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Basic templates</li>
              <li className="flex items-center gap-2 text-zinc-600"><span>✗</span> PDF export</li>
              <li className="flex items-center gap-2 text-zinc-600"><span>✗</span> LinkedIn Post generator</li>
              <li className="flex items-center gap-2 text-zinc-600"><span>✗</span> Watermark removal</li>
            </ul>
            <button className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition font-bold">
              Start Free
            </button>
          </div>

          {/* PRO - one-time */}
          <div className="relative bg-gradient-to-br from-fuchsia-600/30 to-purple-600/20 border border-fuchsia-500/40 rounded-[32px] p-8 shadow-[0_0_60px_rgba(217,70,239,0.25)] flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
              BEST VALUE
            </div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <p className="text-zinc-400 text-sm mb-6">One-time payment</p>
            <p className="text-5xl font-black mb-1">$49</p>
            <p className="text-zinc-400 text-sm mb-8">pay once, yours forever</p>
            <ul className="space-y-3 text-zinc-200 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 50 carousels</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> PNG + PDF export</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All templates</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> LinkedIn Post generator</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> No watermark</li>
              <li className="flex items-center gap-2 text-zinc-600"><span>✗</span> Priority support</li>
            </ul>
            <button onClick={() => handleUpgrade("pro")} className="w-full py-4 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 transition font-bold shadow-[0_0_30px_rgba(217,70,239,0.4)]">
              Get Pro — $49
            </button>
          </div>

          {/* PRO+ - subscription */}
          <div className="bg-white/5 border border-purple-500/30 rounded-[32px] p-8 backdrop-blur-xl flex flex-col">
            <h3 className="text-xl font-bold mb-2">Pro+</h3>
            <p className="text-zinc-500 text-sm mb-6">For power users</p>
            <div className="flex items-end gap-1 mb-1">
              <p className="text-5xl font-black">$19</p>
              <p className="text-zinc-400 text-sm mb-2">/month</p>
            </div>
            <p className="text-zinc-600 text-sm mb-8">cancel anytime</p>
            <ul className="space-y-3 text-zinc-300 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited carousels</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> PNG + PDF export</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All templates</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> LinkedIn Post generator</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> No watermark</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority support</li>
            </ul>
            <button onClick={() => handleUpgrade("pro_plus")} className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 transition font-bold">
              Get Pro+ — $19/mo
            </button>
          </div>

        </div>

        <p className="text-center text-zinc-600 text-sm mt-10">
          🔒 Secure payment via Stripe · 30-day money-back guarantee
        </p>
      </section>

{showSuccess && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-zinc-900 border border-green-500/30 rounded-[32px] p-10 max-w-md text-center mx-4">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-3xl font-black mb-3">Welcome to Pro!</h2>
      <p className="text-zinc-400 mb-8">Your account has been upgraded. Enjoy unlimited carousels and PDF export!</p>
      <button onClick={() => { setShowSuccess(false); window.location.reload(); }} className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 transition font-bold text-lg">
        Start Creating 🚀
      </button>
    </div>
  </div>
)}

      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-purple-500/30 rounded-[32px] p-10 max-w-md text-center mx-4">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl font-black mb-3">Upgrade to Pro</h2>
            <p className="text-zinc-400 mb-8">Get 50 carousels + PDF export for just $49 one-time, or go unlimited with Pro+ at $19/month.</p>
            <button onClick={() => handleUpgrade("pro")} className="w-full py-4 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 transition font-bold text-lg mb-3">
              Upgrade to Pro — $49
            </button>
            <button onClick={() => setShowPaywall(false)} className="text-zinc-500 text-sm hover:text-white transition">
              Maybe later
            </button>
          </div>
        </div>
      )}

    </main>
  );
}