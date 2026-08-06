import { getFeed } from "@/lib/api";
import { Feed } from "@/components/Feed";
import { EmptyState } from "@/components/EmptyState";
import { HistorySpotlight } from "@/components/HistorySpotlight";

// The feed changes with every ingest run, not every deploy — always fetch
// fresh rather than serving a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const result = await getFeed(page);

  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <div className="mt-6">
        <HistorySpotlight />
      </div>

      {!result.ok ? (
        <EmptyState message="Couldn't load the digest." hint={result.error} />
      ) : result.items.length === 0 ? (
        <EmptyState
          message={page === 1 ? "Today's digest hasn't landed yet." : "Nothing on this page."}
          hint={page === 1 ? "Check back after the next run." : undefined}
        />
      ) : (
        <Feed items={result.items} page={result.page} totalPages={result.total_pages} />
      )}
    </div>
  );
}
