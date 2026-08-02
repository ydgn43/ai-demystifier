export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <div className="mb-8 h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
