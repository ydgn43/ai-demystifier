import { getFeed } from "@/lib/api";
import { Feed } from "@/components/Feed";

// The feed changes with every ingest run, not every deploy — always fetch
// fresh rather than serving a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await getFeed();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          AI News Digest
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          The day&apos;s AI papers, models, and tools — demystified.
        </p>
      </header>

      {!result.ok ? (
        <p className="py-16 text-center text-red-600 dark:text-red-400">
          Couldn&apos;t load today&apos;s digest: {result.error}
        </p>
      ) : result.today.length === 0 && result.this_week.length === 0 ? (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">
          No items yet — check back after the next digest run.
        </p>
      ) : (
        <Feed today={result.today} thisWeek={result.this_week} />
      )}
    </div>
  );
}
