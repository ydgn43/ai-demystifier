import Link from "next/link";
import type { Metadata } from "next";
import { getTimeline } from "@/lib/api";
import { TimelineResults } from "@/components/timeline/TimelineResults";
import { EmptyState } from "@/components/EmptyState";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Timeline — AI News Digest",
  description: "Browse everything digested, in order.",
};

// Every page depends on category/cursor query params — never cache a snapshot.
export const dynamic = "force-dynamic";

const CATEGORIES: Category[] = ["Models", "Research", "Developer Tools", "Industry News"];

function filterHref(category: string | undefined): string {
  return category ? `/timeline?category=${encodeURIComponent(category)}` : "/timeline";
}

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; before?: string }>;
}) {
  const { category, before } = await searchParams;
  const result = await getTimeline({ category, before });

  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <h1 className="mt-8 font-sans text-2xl font-semibold text-ink">Timeline</h1>
      <p className="mt-1 font-sans text-sm text-muted">
        Everything digested, in order — a way to catch up on what you missed.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-hairline pb-4">
        <Link
          href="/timeline"
          className={`rounded-[2px] border px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.05em] uppercase transition-colors ${
            !category ? "border-ink bg-ink text-white" : "border-hairline text-muted hover:border-ink"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={filterHref(cat)}
            className={`rounded-[2px] border px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.05em] uppercase transition-colors ${
              category === cat
                ? "border-ink bg-ink text-white"
                : "border-hairline text-muted hover:border-ink"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {!result.ok ? (
        <EmptyState message="Couldn't load the timeline." hint={result.error} />
      ) : result.items.length === 0 ? (
        <EmptyState message="Nothing here yet." />
      ) : (
        <>
          <TimelineResults items={result.items} />

          {result.next_cursor && (
            <Link
              href={`/timeline?${new URLSearchParams({
                ...(category ? { category } : {}),
                before: result.next_cursor,
              })}`}
              className="mt-8 self-center font-mono text-[11px] font-medium tracking-[0.05em] text-muted uppercase hover:text-ink"
            >
              Older &rarr;
            </Link>
          )}
        </>
      )}
    </div>
  );
}
