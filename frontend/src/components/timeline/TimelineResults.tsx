"use client";

import { FeedCard } from "@/components/FeedCard";
import { formatDate } from "@/lib/date";
import { useTimelineProgress } from "@/lib/timeline-progress";
import type { FeedItem } from "@/lib/types";

function groupByDate(items: FeedItem[]): [string, FeedItem[]][] {
  // Items are ordered by fetched_at (ingest time), not published_at, so
  // two items sharing a published date can be non-adjacent in the list —
  // group by a map instead of merging only consecutive entries, otherwise
  // the same date can appear as two separate groups (duplicate React keys).
  const groups = new Map<string, FeedItem[]>();
  for (const item of items) {
    const key = formatDate(item.published_at) ?? "Unknown date";
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return [...groups.entries()];
}

export function TimelineResults({ items }: { items: FeedItem[] }) {
  const { readItems, toggleRead } = useTimelineProgress();
  const readCount = items.filter((item) => readItems.has(item.id)).length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>Read/unread is tracked in this browser only</span>
        <span>
          {readCount} of {items.length} read on this page
        </span>
      </div>

      <div className="mt-4 space-y-8">
        {groupByDate(items).map(([date, dateItems]) => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{date}</h2>
            <ul className="mt-1 divide-y divide-slate-200 dark:divide-slate-800">
              {dateItems.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  level="casual"
                  isRead={readItems.has(item.id)}
                  onToggleRead={() => toggleRead(item.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
