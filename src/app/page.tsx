"use client";

import { useState } from "react";
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
const [cardColor, setCardColor] = useState("#2d1b69")
const [cardFont, setCardFont] = useState("font-sans")
const [userName, setUserName] = useState("CarouselAI")
const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const t = TEMPLATES[style];

  async function generateSlides() {
    if (!idea.trim()) return;
    setLoading(true);
    setSlides([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, style }),
      });
      const data = await res.json();
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

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[140px]" />
      </div>

      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-xl font-black tracking-tight">CarouselAI</div>
        <div className="flex items-center gap-8 text-sm text-zinc-400">
          <button className="hover:text-white transition">Features</button>
          <button className="hover:text-white transition">Pricing</button>
          <button className="hover:text-white transition">Github</button>
          <SignInButton />
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
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

          {/* Right — Input */}
          <div className="flex flex-col gap-4">
            {/* Style selector */}
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

            {/* Input + button */}
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

      {/* SLIDES */}
      {slides.length > 0 && (
        <section className="relative z-10 max-w-2xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-black mb-8 text-center">
            Your carousel — <span className="text-purple-400">{slides.length} slides</span>
          </h2>
{/* Color & Font controls */}
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
    📷 Photo
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
    className={`relative rounded-[28px] overflow-hidden group`}
    style={{
      width: "100%",
      aspectRatio: "1/1",
      background: i % 2 === 0 
        ? `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}99 50%, ${cardColor} 100%)`
: `linear-gradient(135deg, #0f0f1a 0%, ${cardColor}44 50%, #0f0f1a 100%)`,
    }}
  >

    {/* Content */}
    <div className="relative z-10 flex flex-col justify-between h-full p-8">
      {/* Top */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-purple-400">
          {String(i + 1).padStart(2, "0")} / {slides.length.toString().padStart(2, "0")}
        </span>
        <div className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
      </div>

      {/* Title */}
      <div className="flex-1 flex items-center py-6">
        <textarea
          value={slide.title}
          onChange={(e) => updateSlide(i, "title", e.target.value)}
          className={`w-full bg-transparent resize-none outline-none leading-tight text-3xl font-black ${t.title}`}
          rows={3}
        />
      </div>

      {/* Description */}
      <div>
        <textarea
          value={slide.description}
          onChange={(e) => updateSlide(i, "description", e.target.value)}
          className={`w-full bg-transparent resize-none outline-none leading-relaxed text-sm ${t.desc}`}
          rows={3}
        />
        {/* Regenerate button */}
<button
  onClick={() => regenerateSlide(i)}
  className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-white/40 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10"
>
  ↻ regenerate
</button>
        {/* Footer */}
       <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
  {userAvatar ? (
    <img src={userAvatar} className="w-6 h-6 rounded-full object-cover" />
  ) : (
    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
      {userName[0]}
    </div>
  )}
 <span className="text-xs text-white/40">{userName}</span>
</div>

{/* Watermark */}
<div className="absolute bottom-3 right-4 text-[10px] text-white/20 font-medium tracking-widest uppercase">
  Made with CarouselAI
</div>
      </div>
    </div>
  </div>
))}
            
          </div>

          {/* Export buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
            <button
              onClick={downloadPNG}
              className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 transition font-bold"
            >
              Download PNG (ZIP)
            </button>
            <button
              onClick={downloadPDF}
              className="px-8 py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 transition font-bold"
            >
              Export PDF
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
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && slides.length === 0 && (
        <section className="relative z-10 max-w-2xl mx-auto px-6 pb-20 text-center">
          <p className="text-purple-400 text-sm uppercase tracking-[0.3em] mb-4">Showcase</p>
          <h2 className="text-4xl font-black mb-4">See what creators generate</h2>
          <p className="text-zinc-500">Enter a topic above and hit Generate</p>
        </section>
      )}

{/* HOW IT WORKS */}
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
{/* TESTIMONIALS */}
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
      <p className="text-zinc-300 text-sm mb-6">"The Hook → Problem → Solution structure is exactly what top LinkedIn posts use. Game changer."</p>
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
      {/* PRICING */}
      <section className="relative z-10 max-w-6xl mx-auto py-32 px-6">
        <div className="text-center mb-16">
          <p className="text-pink-400 uppercase tracking-[0.3em] text-sm mb-4">Pricing</p>
          <h2 className="text-5xl font-black mb-4">Simple pricing<br />for creators</h2>
          <p className="text-zinc-400">Start free. Upgrade when you scale.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-4">Free</h3>
            <p className="text-5xl font-black mb-6">$0</p>
            <ul className="space-y-3 text-zinc-300 mb-8">
              <li>• 5 carousels/day</li>
              <li>• Basic templates</li>
              <li>• PNG export</li>
            </ul>
            <button className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition">Start Free</button>
          </div>

          <div className="bg-gradient-to-br from-fuchsia-600/30 to-purple-600/20 border border-fuchsia-500/40 rounded-[32px] p-8 scale-105 shadow-[0_0_60px_rgba(217,70,239,0.25)]">
            <p className="text-pink-300 mb-3 text-sm font-bold uppercase tracking-widest">Most Popular</p>
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-5xl font-black mb-6">$19</p>
            <ul className="space-y-3 text-zinc-200 mb-8">
              <li>• Unlimited carousels</li>
              <li>• AI storytelling</li>
              <li>• PDF export</li>
              <li>• Viral hooks</li>
            </ul>
            <button className="w-full py-4 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 transition font-bold shadow-[0_0_30px_rgba(217,70,239,0.4)]">
              Go Pro
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-4">Agency</h3>
            <p className="text-5xl font-black mb-6">$99</p>
            <ul className="space-y-3 text-zinc-300 mb-8">
              <li>• Team access</li>
              <li>• Brand templates</li>
              <li>• Priority support</li>
              <li>• Unlimited exports</li>
            </ul>
            <button className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition">Contact Sales</button>
          </div>
        </div>
      </section>

    </main>
  );
}