"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SignInButton } from "../components/SignInButton";
import jsPDF from "jspdf";
import { TEMPLATES, TONES, type TemplateKey, type ToneKey } from "@/lib/templates";

interface Slide {
  title: string;
  description: string;
  type: string;
}

export default function Create() {
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState<TemplateKey>("Viral");
  const [tone, setTone] = useState<ToneKey>("Authority");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkedInPost, setLinkedInPost] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [cardFont, setCardFont] = useState("font-sans");
  const [userName, setUserName] = useState("CarouselAI");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const t = TEMPLATES[style];
  const { data: session } = useSession();

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

  async function generateSlides() {
    if (!idea.trim()) return;
    if (!session?.user?.email) {
      signIn();
      return;
    }
    setLoading(true);
    setSlides([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, style, tone, email: session.user.email }),
      });
      const data = await res.json();
      if (data.error === "limit_reached") {
        setShowPaywall(true);
        setLoading(false);
        return;
      }
      if (data.error === "sign_in_required") {
        signIn();
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
    if (!session?.user?.email) {
      signIn();
      return;
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, style, tone, email: session.user.email }),
      });
      const data = await res.json();
      if (data.error === "limit_reached") {
        setShowPaywall(true);
        return;
      }
      if (data.error === "sign_in_required") {
        signIn();
        return;
      }
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
    if (!session?.user?.email) {
      signIn();
      return;
    }
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    setLoadingPost(true);
    try {
      const slidesText = slides.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join("\n");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: `Write a LinkedIn post (max 200 words) to introduce this carousel about: ${idea}. Slides: ${slidesText}. Include hook, value, and CTA. Add relevant emojis.`,
          style,
          email: session.user.email,
          mode: "linkedin_post",
        }),
      });
      const data = await res.json();
      if (data.error === "pro_required") {
        setShowPaywall(true);
        setLoadingPost(false);
        return;
      }
      if (data.slides?.[0]?.title) {
        setLinkedInPost(data.slides[0].title + "\n\n" + data.slides[0].description);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingPost(false);
  }

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

    const PAGE_W = 540;
    const PAGE_H = 675;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [PAGE_W, PAGE_H],
    });

    for (let i = 0; i < slides.length; i++) {
      const el = document.getElementById(`slide-${i}`);
      if (!el) continue;

      const btn = el.querySelector("[data-pdf-hide]") as HTMLElement;
      if (btn) btn.style.display = "none";

      const textareas = el.querySelectorAll("textarea");
      const replacements: { ta: HTMLTextAreaElement; div: HTMLDivElement }[] = [];
      textareas.forEach((ta) => {
        const div = document.createElement("div");
        div.style.cssText = window.getComputedStyle(ta).cssText;
        div.style.whiteSpace = "pre-wrap";
        div.style.overflow = "visible";
        div.textContent = ta.value;
        div.className = ta.className;
        ta.parentNode?.insertBefore(div, ta);
        ta.style.display = "none";
        replacements.push({ ta, div });
      });

      const prevWidth = el.style.width;
      const prevHeight = el.style.height;
      const prevAspect = el.style.aspectRatio;
      el.style.width = "1080px";
      el.style.height = "1350px";
      el.style.aspectRatio = "unset";

      await new Promise((r) => setTimeout(r, 150));

      const dataUrl = await toPng(el, {
        pixelRatio: 1,
        width: 1080,
        height: 1350,
        backgroundColor: "#000000",
      });

      el.style.width = prevWidth;
      el.style.height = prevHeight;
      el.style.aspectRatio = prevAspect;
      replacements.forEach(({ ta, div }) => {
        ta.style.display = "";
        div.remove();
      });
      if (btn) btn.style.display = "";

      if (i > 0) pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, 0, PAGE_W, PAGE_H);
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
        <Link href="/" className="text-xl font-black tracking-tight">CarouselAI</Link>
        <div className="flex items-center gap-4">
          {isPro && <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold">PRO</span>}
          <SignInButton />
        </div>
      </nav>

      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-10">
        <h1 className="text-3xl font-black mb-8 text-center">Create your carousel</h1>

        <div className="flex flex-col gap-4">
          <div className="flex gap-3 flex-wrap justify-center">
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

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 uppercase tracking-wider mr-1">Tone:</span>
            {TONES.map((item) => (
              <button
                key={item}
                onClick={() => setTone(item)}
                className={`px-4 py-1.5 rounded-full border transition-all duration-200 text-xs ${
                  tone === item
                    ? "bg-fuchsia-600 border-fuchsia-500 text-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:border-fuchsia-500/40"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <textarea
              id="idea-input"
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setUserAvatar(reader.result as string);
                      reader.readAsDataURL(file);
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
                className={`relative rounded-[28px] overflow-hidden ${t.card}`}
                style={{ width: "100%", aspectRatio: "4/5" }}
              >
                <div className={`relative z-10 flex flex-col h-full p-8 ${cardFont}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold tracking-[0.3em] uppercase ${t.num}`}>
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

                  <div className={`flex items-center gap-2 pt-4 border-t ${t.isLight ? "border-black/10" : "border-white/10"}`}>
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {userName[0]}
                      </div>
                    )}
                    <span className={`text-xs ${t.isLight ? "text-black/40" : "text-white/40"}`}>{userName}</span>
                    {isPro ? (
                      <span className={`ml-auto text-[10px] font-medium tracking-widest uppercase ${t.isLight ? "text-black/20" : "text-white/20"}`}>CarouselAI</span>
                    ) : (
                      <span className={`ml-auto text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded-full border ${t.isLight ? "bg-black/5 text-black/60 border-black/10" : "bg-white/10 text-white/70 border-white/20"}`}>
                        Made with CarouselAI
                      </span>
                    )}
                  </div>

                  <button
                    data-pdf-hide
                    onClick={() => regenerateSlide(i)}
                    className={`absolute top-3 left-1/2 -translate-x-1/2 text-[10px] transition px-3 py-1 rounded-full border ${t.isLight ? "text-black/40 hover:text-black bg-black/5 hover:bg-black/10 border-black/10" : "text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"}`}
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
              className={`px-8 py-4 rounded-2xl transition font-bold disabled:opacity-50 flex items-center gap-2 ${isPro ? "bg-blue-600 hover:bg-blue-500" : "bg-white/10 border border-white/10 hover:bg-white/20"}`}
            >
              {!isPro && <span className="text-yellow-400">🔒</span>}
              {loadingPost ? "Generating..." : `LinkedIn Post ${!isPro ? "(Pro)" : ""}`}
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

      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-purple-500/30 rounded-[32px] p-10 max-w-md text-center mx-4">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl font-black mb-3">Upgrade to Pro</h2>
            <p className="text-zinc-400 mb-8">Get unlimited carousels, PDF export, and no watermark for $24/month — or $19/mo billed annually.</p>
            <button onClick={() => handleUpgrade("pro_monthly")} className="w-full py-4 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 transition font-bold text-lg mb-3">Upgrade to Pro — $24/mo</button>
            <button onClick={() => setShowPaywall(false)} className="text-zinc-500 text-sm hover:text-white transition">Maybe later</button>
          </div>
        </div>
      )}
    </main>
  );
}
