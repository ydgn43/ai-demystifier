import { getFeed } from "@/lib/api";
import { Feed } from "@/components/Feed";
import { EmptyState } from "@/components/EmptyState";

// The feed changes with every ingest run, not every deploy — always fetch
// fresh rather than serving a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await getFeed();

  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      {!result.ok ? (
        <EmptyState message="Couldn't load today's digest." hint={result.error} />
      ) : result.today.length === 0 && result.this_week.length === 0 ? (
        <EmptyState
          message="Today's digest hasn't landed yet."
          hint="Check back after the next run."
        />
      ) : (
        <Feed today={result.today} thisWeek={result.this_week} />
      )}
    </div>
  );
}
