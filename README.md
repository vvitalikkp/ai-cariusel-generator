# CarouselAI

AI-powered carousel generator for LinkedIn and Instagram. Turn any topic or URL into a polished, ready-to-publish carousel in seconds.

## Features

- Generate carousels from a topic, text, or YouTube video URL
- Choose from multiple visual templates
- Brand Kit: custom card background and accent color per user
- Export as PDF or PNG
- Free tier + Pro subscription via Stripe
- Lifetime Deal (LTD) one-time purchase option

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Auth & DB**: Supabase
- **Payments**: Stripe
- **AI**: Claude API (Anthropic)
- **PDF export**: jsPDF

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Deploy

Deployed on Vercel. Push to `main` triggers automatic deployment.
