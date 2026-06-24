export const TEMPLATES = {
  Viral: {
    card: "bg-black border border-purple-500/40",
    title: "text-white font-black text-3xl tracking-tight",
    desc: "text-zinc-400",
    dot: "bg-pink-400 shadow-[0_0_12px_#f472b6]",
    num: "text-purple-300",
    isLight: false,
  },
  Storytelling: {
    card: "bg-gradient-to-br from-fuchsia-900/40 to-black border border-fuchsia-500/30",
    title: "text-white font-black text-3xl italic",
    desc: "text-zinc-300",
    dot: "bg-pink-400 shadow-[0_0_12px_#f472b6]",
    num: "text-fuchsia-300",
    isLight: false,
  },
  Minimal: {
    card: "bg-zinc-950 border border-white/10",
    title: "text-white font-bold text-3xl",
    desc: "text-zinc-500",
    dot: "bg-white",
    num: "text-zinc-500",
    isLight: false,
  },
  Corporate: {
    card: "bg-blue-950 border border-blue-400/20",
    title: "text-white font-extrabold text-3xl uppercase",
    desc: "text-blue-100",
    dot: "bg-cyan-400 shadow-[0_0_12px_#22d3ee]",
    num: "text-cyan-300",
    isLight: false,
  },
  Light: {
    card: "bg-white border border-gray-100",
    title: "text-gray-900 font-black text-3xl tracking-tight",
    desc: "text-gray-500",
    dot: "bg-purple-500",
    num: "text-gray-300",
    isLight: true,
  },
  Gradient: {
    card: "bg-gradient-to-br from-violet-600 to-indigo-600 border-0",
    title: "text-white font-black text-3xl",
    desc: "text-white/70",
    dot: "bg-yellow-300 shadow-[0_0_12px_#fde047]",
    num: "text-white/30",
    isLight: false,
  },
  Bold: {
    card: "bg-yellow-400 border-0",
    title: "text-black font-black text-3xl uppercase tracking-tighter",
    desc: "text-black/60",
    dot: "bg-black",
    num: "text-black/20",
    isLight: true,
  },
  Neon: {
    card: "bg-black border border-green-400/30",
    title: "text-green-400 font-black text-3xl",
    desc: "text-green-200/60",
    dot: "bg-green-400 shadow-[0_0_12px_#4ade80]",
    num: "text-green-700",
    isLight: false,
  },
  Linear: {
    card: "bg-[#08090c] border border-white/[0.07]",
    title: "text-white font-semibold text-3xl tracking-tight",
    desc: "text-zinc-400",
    dot: "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]",
    num: "text-zinc-500",
    isLight: false,
  },
  Stripe: {
    card: "bg-gradient-to-br from-[#f6f9fc] to-[#eef1f6] border border-black/5",
    title: "text-slate-900 font-semibold text-3xl tracking-tight",
    desc: "text-slate-500",
    dot: "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]",
    num: "text-slate-400",
    isLight: true,
  },
  Raycast: {
    card: "bg-black border border-white/[0.08]",
    title: "text-white font-semibold text-3xl tracking-tight",
    desc: "text-zinc-400",
    dot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
    num: "text-red-400",
    isLight: false,
  },
} as const;

export type TemplateKey = keyof typeof TEMPLATES;

export const TONES = ["Storytelling", "Authority", "Contrarian", "Data-Driven"] as const;
export type ToneKey = (typeof TONES)[number];

export const SHOWCASE_EXAMPLES: { style: TemplateKey; title: string; desc: string }[] = [
  {
    style: "Viral",
    title: "I Quit My 9-to-5 to Build This",
    desc: "Everyone said I was crazy. Six months later, this side project pays my rent. Here's exactly what changed.",
  },
  {
    style: "Stripe",
    title: "3 Metrics Every Founder Should Track",
    desc: "Most founders obsess over vanity metrics. These three numbers actually predict whether your startup survives.",
  },
  {
    style: "Linear",
    title: "Why Most Startups Get Positioning Wrong",
    desc: "You're not competing on features. You're competing on a single sentence in your customer's head.",
  },
  {
    style: "Gradient",
    title: "The LinkedIn Algorithm Just Changed",
    desc: "Reach dropped 40% overnight for most creators. Here's what's actually working in the new feed.",
  },
];
