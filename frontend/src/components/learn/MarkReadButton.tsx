"use client";

import { useLearnProgress } from "@/lib/learn-progress";

export function MarkReadButton({ slug }: { slug: string }) {
  const { completed, toggleComplete } = useLearnProgress();
  const isDone = completed.has(slug);

  return (
    <button
      type="button"
      onClick={() => toggleComplete(slug)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        isDone
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
      }`}
    >
      {isDone ? "✓ Read" : "Mark as read"}
    </button>
  );
}
