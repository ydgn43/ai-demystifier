"use client";

import { useMemo, useState } from "react";
import type { Category, FeedItem } from "@/lib/types";
import { FeedCard } from "@/components/FeedCard";

const CATEGORIES: Category[] = ["Models", "Research", "Developer Tools", "Industry News"];
const CATEGORY_FILTERS = ["All", ...CATEGORIES] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const LEVELS = ["casual", "developer"] as const;
type Level = (typeof LEVELS)[number];

export function Feed({ items }: { items: FeedItem[] }) {
  const [level, setLevel] = useState<Level>("casual");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filtered = useMemo(
    () => (category === "All" ? items : items.filter((item) => item.category === category)),
    [items, category],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          {LEVELS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLevel(option)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                level === option
                  ? "bg-white text-slate-900 shadow dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                category === option
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">
          No items in this category yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {filtered.map((item) => (
            <FeedCard key={item.id} item={item} level={level} />
          ))}
        </ul>
      )}
    </div>
  );
}
