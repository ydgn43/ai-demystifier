"use client";

import Link from "next/link";
import { LEVELS, LEVEL_LABELS, type LearnArticle } from "@/lib/learn-content";
import { useLearnProgress } from "@/lib/learn-progress";
import { readingTimeMinutes } from "@/lib/reading-time";

export function LearnIndexClient({ articles }: { articles: LearnArticle[] }) {
  const { completed } = useLearnProgress();
  const doneCount = articles.filter((a) => completed.has(a.slug)).length;
  const pct = Math.round((doneCount / articles.length) * 100);

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
          <span>Your progress</span>
          <span>
            {doneCount} of {articles.length} completed
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-300 dark:bg-white"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {LEVELS.map((level) => {
          const levelArticles = articles.filter((a) => a.level === level);
          if (levelArticles.length === 0) return null;
          return (
            <div key={level}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {LEVEL_LABELS[level]}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {levelArticles.map((article) => {
                  const isDone = completed.has(article.slug);
                  return (
                    <Link
                      key={article.slug}
                      href={`/learn/${article.slug}`}
                      className="group relative flex flex-col rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
                    >
                      {isDone && (
                        <span
                          aria-label="Completed"
                          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white"
                        >
                          ✓
                        </span>
                      )}
                      <span className="text-2xl">{article.icon}</span>
                      <span className="mt-2 font-semibold text-slate-900 group-hover:underline dark:text-white">
                        {article.title}
                      </span>
                      <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {article.teaser}
                      </span>
                      <span className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                        {readingTimeMinutes(article.body)} min read
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
