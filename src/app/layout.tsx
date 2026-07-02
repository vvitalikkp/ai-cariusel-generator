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
  title: "CarouselAI — Turn any idea into a LinkedIn carousel in 30 seconds",
  description: "AI-powered LinkedIn carousel generator. Paste a topic, YouTube link, article, or PDF — get a polished 6-slide carousel with Brand Kit, 25 templates, PNG & PDF export. Free to try.",
  openGraph: {
    title: "CarouselAI — Turn any idea into a LinkedIn carousel in 30 seconds",
    description: "AI carousel generator. 25 templates, Brand Kit, YouTube/PDF import. Free to try.",
    url: "https://www.aicarousel.tech",
    siteName: "CarouselAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarouselAI — Turn any idea into a LinkedIn carousel in 30 seconds",
    description: "AI carousel generator. 25 templates, Brand Kit, YouTube/PDF import. Free to try.",
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