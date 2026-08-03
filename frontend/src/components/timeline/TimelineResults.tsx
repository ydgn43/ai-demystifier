"use client";

import { FeedCard } from "@/components/FeedCard";
import { formatDate } from "@/lib/date";
import { useReadProgress } from "@/lib/read-progress";
import { ACCENT_CASUAL } from "@/lib/theme";
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
  const { readItems, toggleRead } = useReadProgress();
  const readCount = items.filter((item) => readItems.has(item.id)).length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between font-mono text-[11px] tracking-wide text-muted">
        <span>Read/unread tracked in this browser only</span>
        <span>
          {readCount} of {items.length} read on this page
        </span>
      </div>

      {/* The vertical rail is the actual "timeline" — a continuous line
          down the page with a node per date, so this reads as visually
          distinct from the plain list on the homepage feed. */}
      <div className="relative mt-4 border-l-2 border-hairline pl-6">
        {groupByDate(items).map(([date, dateItems]) => (
          <div key={date} className="relative pb-8 last:pb-0">
            <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-bg bg-muted" />
            <h2 className="font-mono text-[11px] font-semibold tracking-[0.05em] text-muted uppercase">
              {date}
            </h2>
            <ul className="mt-2 flex flex-col gap-3">
              {dateItems.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  level="casual"
                  accentColor={ACCENT_CASUAL}
                  animKey={0}
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
