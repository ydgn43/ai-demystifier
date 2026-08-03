import Link from "next/link";
import type { Metadata } from "next";
import { getTimeline } from "@/lib/api";
import { TimelineResults } from "@/components/timeline/TimelineResults";
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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Timeline
      </h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Everything digested, in order — a way to catch up on what you missed.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <Link
          href="/timeline"
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !category
              ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
              : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={filterHref(cat)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              category === cat
                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {!result.ok ? (
        <p className="py-16 text-center text-red-600 dark:text-red-400">
          Couldn&apos;t load the timeline: {result.error}
        </p>
      ) : result.items.length === 0 ? (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">Nothing here yet.</p>
      ) : (
        <>
          <TimelineResults items={result.items} />

          {result.next_cursor && (
            <Link
              href={`/timeline?${new URLSearchParams({
                ...(category ? { category } : {}),
                before: result.next_cursor,
              })}`}
              className="mt-8 self-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Older &rarr;
            </Link>
          )}
        </>
      )}
    </div>
  );
}
