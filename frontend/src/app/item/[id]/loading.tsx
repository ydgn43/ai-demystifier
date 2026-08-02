export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
      <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
