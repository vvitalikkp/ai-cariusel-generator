import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.aicarousel.tech";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/create`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ltd`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
