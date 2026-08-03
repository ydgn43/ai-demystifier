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
      <div className="border border-hairline bg-card p-4">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-wide text-muted">
          <span>YOUR PROGRESS</span>
          <span>
            {doneCount} of {articles.length} completed
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
          <div className="h-full bg-ink transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {LEVELS.map((level) => {
          const levelArticles = articles.filter((a) => a.level === level);
          if (levelArticles.length === 0) return null;
          return (
            <div key={level}>
              <h2 className="font-mono text-[11px] font-semibold tracking-[0.05em] text-muted uppercase">
                {LEVEL_LABELS[level]}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {levelArticles.map((article) => {
                  const isDone = completed.has(article.slug);
                  return (
                    <Link
                      key={article.slug}
                      href={`/learn/${article.slug}`}
                      className="group relative flex flex-col border border-hairline bg-card p-4 transition-colors hover:border-ink"
                    >
                      {isDone && (
                        <span
                          aria-label="Completed"
                          className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white"
                        >
                          ✓
                        </span>
                      )}
                      <span className="text-2xl">{article.icon}</span>
                      <span className="mt-2 font-sans font-semibold text-ink group-hover:underline">
                        {article.title}
                      </span>
                      <span className="mt-1 font-sans text-sm text-muted">{article.teaser}</span>
                      <span className="mt-3 font-mono text-[10px] tracking-wide text-muted">
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
