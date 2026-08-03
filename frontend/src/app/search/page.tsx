import type { Metadata } from "next";
import { searchItems } from "@/lib/api";
import { FeedCard } from "@/components/FeedCard";
import { EmptyState } from "@/components/EmptyState";
import { ACCENT_CASUAL } from "@/lib/theme";

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

async function SearchResults({ q }: { q: string }) {
  const result = await searchItems(q);

  if (!result.ok) {
    return <EmptyState message="Search failed." hint={result.error} />;
  }

  if (result.items.length === 0) {
    return <EmptyState message={`No results for "${q}".`} />;
  }

  return (
    <>
      <p className="mt-3 mb-4 font-mono text-[11px] tracking-wide text-muted">
        {result.items.length} result{result.items.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
      </p>
      <ul className="flex flex-col gap-3">
        {result.items.map((item) => (
          <FeedCard key={item.id} item={item} level="casual" accentColor={ACCENT_CASUAL} animKey={0} />
        ))}
      </ul>
    </>
  );
}
