import type { MetadataRoute } from "next";
import { getFeed } from "@/lib/api";

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
    ...items.map((item) => ({
      url: `${SITE_URL}/item/${item.id}`,
      lastModified: item.published_at ?? undefined,
      changeFrequency: "never" as const,
      priority: 0.6,
    })),
  ];
}
