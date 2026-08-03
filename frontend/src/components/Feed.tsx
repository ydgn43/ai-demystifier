"use client";

import { useMemo, useState } from "react";
import type { Category, FeedItem, Level } from "@/lib/types";
import { FeedCard } from "@/components/FeedCard";
import { EmptyState } from "@/components/EmptyState";
import { LevelToggle } from "@/components/LevelToggle";
import { useReadProgress } from "@/lib/read-progress";
import { accentColorFor } from "@/lib/theme";

const CATEGORIES: Category[] = ["Models", "Research", "Developer Tools", "Industry News"];
const CATEGORY_FILTERS = ["All", ...CATEGORIES] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

function groupByCategory(items: FeedItem[]): [Category, FeedItem[]][] {
  return CATEGORIES.map(
    (cat): [Category, FeedItem[]] => [cat, items.filter((item) => item.category === cat)],
  ).filter(([, group]) => group.length > 0);
}

function CategoryGroups({
  items,
  level,
  accentColor,
  animKey,
  readItems,
}: {
  items: FeedItem[];
  level: Level;
  accentColor: string;
  animKey: number;
  readItems: Set<number>;
}) {
  return (
    <div className="space-y-7">
      {groupByCategory(items).map(([category, group]) => (
        <div key={category}>
          <h3 className="mb-2 font-mono text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
            {category} ({group.length})
          </h3>
          <ul className="flex flex-col gap-3">
            {group.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                level={level}
                accentColor={accentColor}
                animKey={animKey}
                isRead={readItems.has(item.id)}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Feed({ today, thisWeek }: { today: FeedItem[]; thisWeek: FeedItem[] }) {
  const [level, setLevel] = useState<Level>("casual");
  const [animKey, setAnimKey] = useState(0);
  const [category, setCategory] = useState<CategoryFilter>("All");
  const { readItems } = useReadProgress();
  const accentColor = accentColorFor(level);

  const handleLevelChange = (l: Level) => {
    setLevel(l);
    setAnimKey((k) => k + 1);
  };

  const filteredToday = useMemo(
    () => (category === "All" ? today : today.filter((item) => item.category === category)),
    [today, category],
  );
  const filteredThisWeek = useMemo(
    () => (category === "All" ? thisWeek : thisWeek.filter((item) => item.category === category)),
    [thisWeek, category],
  );
  const visibleCount = filteredToday.length + filteredThisWeek.length;
  const readCount =
    filteredToday.filter((item) => readItems.has(item.id)).length +
    filteredThisWeek.filter((item) => readItems.has(item.id)).length;

  return (
    <div>
      <div className="sticky top-14 z-20 flex flex-col items-center gap-3 border-b border-hairline bg-bg py-4">
        <LevelToggle level={level} onChange={handleLevelChange} accentColor={accentColor} showLabel />

        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORY_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={`rounded-[2px] border px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.05em] uppercase transition-colors ${
                category === option
                  ? "border-ink bg-ink text-bg"
                  : "border-hairline text-muted hover:border-ink"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filteredToday.length === 0 && filteredThisWeek.length === 0 ? (
        <EmptyState message="No items in this category yet." />
      ) : (
        <div className="mt-5 space-y-10">
          <p className="text-right font-mono text-[11px] tracking-wide text-muted">
            {readCount} of {visibleCount} read
          </p>

          <section>
            <h2 className="mb-3 font-sans text-lg font-semibold text-ink">Today</h2>
            {filteredToday.length === 0 ? (
              <p className="font-sans text-sm text-muted">
                No new items yet today — here&apos;s what&apos;s been happening this week.
              </p>
            ) : (
              <CategoryGroups
                items={filteredToday}
                level={level}
                accentColor={accentColor}
                animKey={animKey}
                readItems={readItems}
              />
            )}
          </section>

          {filteredThisWeek.length > 0 && (
            <section>
              <h2 className="mb-3 font-mono text-[11px] font-semibold tracking-[0.05em] text-muted uppercase">
                Earlier this week
              </h2>
              <CategoryGroups
                items={filteredThisWeek}
                level={level}
                accentColor={accentColor}
                animKey={animKey}
                readItems={readItems}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
