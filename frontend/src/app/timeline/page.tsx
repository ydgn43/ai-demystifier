import Link from "next/link";
import type { Metadata } from "next";
import { HISTORY_ERAS, HISTORY_MILESTONES } from "@/lib/history-content";
import { HistoryTimeline } from "@/components/timeline/HistoryTimeline";
import { EmptyState } from "@/components/EmptyState";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Timeline — AI News Digest",
  description: "A history of AI and machine learning, from its origins to today's models.",
};

const CATEGORIES: Category[] = ["Models", "Research", "Developer Tools", "Industry News"];

const MILESTONE_YEARS = HISTORY_MILESTONES.map((m) => m.year);
const EARLIEST_YEAR = Math.min(...MILESTONE_YEARS);
const LATEST_YEAR = Math.max(...MILESTONE_YEARS);

function filterHref(category: string | undefined): string {
  return category ? `/timeline?category=${encodeURIComponent(category)}` : "/timeline";
}

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const milestones = category
    ? HISTORY_MILESTONES.filter((milestone) => milestone.category === category)
    : HISTORY_MILESTONES;

  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <h1 className="mt-8 font-sans text-2xl font-semibold text-ink">Timeline</h1>
      <p className="mt-1 font-sans text-sm text-muted">
        A history of AI and machine learning — the research, models, tools, and companies that
        shaped the field, from its 1940s origins to today.
      </p>

      <p className="mt-3 font-mono text-[10px] tracking-wide text-muted uppercase">
        {HISTORY_MILESTONES.length} milestones &middot; {HISTORY_ERAS.length} eras &middot; {EARLIEST_YEAR}
        &ndash;{LATEST_YEAR}
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-hairline pb-4">
        <Link
          href="/timeline"
          className={`rounded-[2px] border px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.05em] uppercase transition-colors ${
            !category ? "border-ink bg-ink text-bg" : "border-hairline text-muted hover:border-ink"
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
                ? "border-ink bg-ink text-bg"
                : "border-hairline text-muted hover:border-ink"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {milestones.length === 0 ? (
        <EmptyState message="Nothing in this category yet." />
      ) : (
        <HistoryTimeline milestones={milestones} />
      )}
    </div>
  );
}
