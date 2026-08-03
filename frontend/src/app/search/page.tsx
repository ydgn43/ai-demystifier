import type { Metadata } from "next";
import { searchItems } from "@/lib/api";
import { FeedCard } from "@/components/FeedCard";

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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Search</h1>

      {!q ? (
        <p className="mt-6 text-slate-500 dark:text-slate-400">
          Use the search box above to find something you remember reading.
        </p>
      ) : (
        <SearchResults q={q} />
      )}
    </div>
  );
}

async function SearchResults({ q }: { q: string }) {
  const result = await searchItems(q);

  if (!result.ok) {
    return (
      <p className="py-16 text-center text-red-600 dark:text-red-400">
        Search failed: {result.error}
      </p>
    );
  }

  if (result.items.length === 0) {
    return (
      <p className="mt-6 text-slate-500 dark:text-slate-400">
        No results for &ldquo;{q}&rdquo;.
      </p>
    );
  }

  return (
    <>
      <p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
        {result.items.length} result{result.items.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
      </p>
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {result.items.map((item) => (
          <FeedCard key={item.id} item={item} level="casual" />
        ))}
      </ul>
    </>
  );
}
