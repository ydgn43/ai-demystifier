"use client";

import { useLearnProgress } from "@/lib/learn-progress";

export function MarkReadButton({ slug }: { slug: string }) {
  const { completed, toggleComplete } = useLearnProgress();
  const isDone = completed.has(slug);

  return (
    <button
      type="button"
      onClick={() => toggleComplete(slug)}
      className={`inline-flex items-center gap-1.5 rounded-[3px] border px-4 py-1.5 font-mono text-[11px] font-medium tracking-[0.05em] uppercase transition-colors ${
        isDone ? "border-ink bg-ink text-white" : "border-hairline text-muted hover:border-ink"
      }`}
    >
      {isDone ? "✓ Read" : "Mark as read"}
    </button>
  );
}
