import Link from "next/link";
import type { Metadata } from "next";
import { searchItems } from "@/lib/api";
import { FeedCard } from "@/components/FeedCard";
import { EmptyState } from "@/components/EmptyState";
import { ACCENT_CASUAL } from "@/lib/theme";
import { LEARN_ARTICLES } from "@/lib/learn-content";
import { HISTORY_MILESTONES } from "@/lib/history-content";

export const metadata: Metadata = {
  title: "Search — AI News Digest",
};

// Search results depend on the query string, never cache a snapshot.
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <h1 className="mt-8 font-sans text-2xl font-semibold text-ink">Search</h1>

      {!q ? (
        <p className="mt-6 font-sans text-sm text-muted">
          Use the search box above to find something you remember reading.
        </p>
      ) : (
        <SearchResults q={q} />
      )}
    </div>
  );
}

function matches(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q.toLowerCase());
}

async function SearchResults({ q }: { q: string }) {
  const result = await searchItems(q);
  const feedItems = result.ok ? result.items : [];

  // Learn/History are static data, not backed by Postgres full-text search
  // — a plain substring match at request time is enough at this size, no
  // new infra needed.
  const learnMatches = LEARN_ARTICLES.filter(
    (a) => matches(a.title, q) || matches(a.teaser, q) || matches(a.keywords, q),
  );
  const historyMatches = HISTORY_MILESTONES.filter(
    (m) => matches(m.title, q) || matches(m.blurb, q),
  );
  const totalResults = feedItems.length + learnMatches.length + historyMatches.length;

  if (totalResults === 0) {
    if (!result.ok) {
      return <EmptyState message="Search failed." hint={result.error} />;
    }
    return <EmptyState message={`No results for "${q}".`} />;
  }

  return (
    <>
      <p className="mt-3 mb-4 font-mono text-[11px] tracking-wide text-muted">
        {totalResults} result{totalResults === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
      </p>

      {feedItems.length > 0 && (
        <ul className="flex flex-col gap-3">
          {feedItems.map((item) => (
            <FeedCard key={item.id} item={item} level="casual" accentColor={ACCENT_CASUAL} animKey={0} />
          ))}
        </ul>
      )}

      {learnMatches.length > 0 && (
        <div className={feedItems.length > 0 ? "mt-8" : ""}>
          <h2 className="mb-3 font-mono text-[11px] font-semibold tracking-[0.05em] text-muted uppercase">
            From Learn
          </h2>
          <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
            {learnMatches.map((article) => (
              <li key={article.slug} className="py-3">
                <Link
                  href={`/learn/${article.slug}`}
                  className="font-sans font-semibold text-ink hover:underline"
                >
                  {article.icon} {article.title}
                </Link>
                <p className="mt-1 font-sans text-sm text-muted">{article.teaser}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {historyMatches.length > 0 && (
        <div className={feedItems.length > 0 || learnMatches.length > 0 ? "mt-8" : ""}>
          <h2 className="mb-3 font-mono text-[11px] font-semibold tracking-[0.05em] text-muted uppercase">
            From History
          </h2>
          <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
            {historyMatches.map((milestone) => (
              <li key={milestone.title} className="py-3">
                <Link
                  href={`/timeline?category=${encodeURIComponent(milestone.category)}`}
                  className="font-sans font-semibold text-ink hover:underline"
                >
                  {milestone.title}
                </Link>
                <span className="ml-2 font-mono text-[10px] text-muted">{milestone.date}</span>
                <p className="mt-1 font-sans text-sm text-muted">{milestone.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
