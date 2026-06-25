import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aicarousel.tech"),
  title: "CarouselAI — Create Viral LinkedIn Carousels with AI",
  description: "Paste a tweet, an idea, or an article. Get a polished 6-slide LinkedIn carousel in seconds — hooks, structure, and design handled by AI.",
  openGraph: {
    title: "CarouselAI — Create Viral LinkedIn Carousels with AI",
    description: "Paste a tweet, an idea, or an article. Get a polished 6-slide LinkedIn carousel in seconds.",
    url: "https://www.aicarousel.tech",
    siteName: "CarouselAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarouselAI — Create Viral LinkedIn Carousels with AI",
    description: "Paste a tweet, an idea, or an article. Get a polished 6-slide LinkedIn carousel in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}