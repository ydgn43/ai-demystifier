import { getFeed } from "@/lib/api";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

// Same reasoning as sitemap.ts/page.tsx: the feed changes with every ingest
// run, not every deploy, so this can't be a build-time static response.
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const result = await getFeed();
  const items = result.ok ? result.items : [];

  const itemsXml = items
    .map((item) => {
      const link = `${SITE_URL}/item/${item.id}`;
      const pubDate = item.published_at ? new Date(item.published_at).toUTCString() : null;
      return [
        "    <item>",
        `      <title>${escapeXml(item.headline)}</title>`,
        `      <link>${link}</link>`,
        `      <guid>${link}</guid>`,
        `      <description>${escapeXml(item.level1)}</description>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  // RSS 2.0 over Atom: simpler, no namespace/id boilerplate, and every feed
  // reader supports it — this app has no need for Atom-specific features.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI News Digest</title>
    <link>${SITE_URL}</link>
    <description>A daily, plain-English digest of AI papers, models, and tools.</description>
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
