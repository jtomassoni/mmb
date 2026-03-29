import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) return [];

  const last = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: last, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/about`,
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/blog`,
      lastModified: last,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  for (const post of blogPosts) {
    entries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
