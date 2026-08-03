import type { MetadataRoute } from "next";
import { getFeed } from "@/lib/api";
import { LEARN_ARTICLES } from "@/lib/learn-content";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

// New items land daily — a build-time snapshot would miss all of them
// until the next deploy, defeating the point of a sitemap.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await getFeed();
  const items = result.ok ? [...result.today, ...result.this_week] : [];

  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/timeline`, changeFrequency: "hourly", priority: 0.5 },
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
