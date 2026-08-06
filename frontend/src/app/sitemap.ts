import type { MetadataRoute } from "next";
import { getFeed } from "@/lib/api";
import { LEARN_ARTICLES } from "@/lib/learn-content";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

// New items land daily — a build-time snapshot would miss all of them
// until the next deploy, defeating the point of a sitemap.
export const dynamic = "force-dynamic";

async function getAllItems() {
  const first = await getFeed(1);
  if (!first.ok) return [];

  const items = [...first.items];
  for (let page = 2; page <= first.total_pages; page++) {
    const result = await getFeed(page);
    if (result.ok) items.push(...result.items);
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getAllItems();

  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/timeline`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/learn`, changeFrequency: "monthly", priority: 0.5 },
    ...LEARN_ARTICLES.map((article) => ({
      url: `${SITE_URL}/learn/${article.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...items.map((item) => ({
      url: `${SITE_URL}/item/${item.id}`,
      lastModified: item.published_at ?? undefined,
      changeFrequency: "never" as const,
      priority: 0.6,
    })),
  ];
}
