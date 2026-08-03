import Link from "next/link";
import type { Metadata } from "next";
import { LEARN_ARTICLES, type LearnLevel } from "@/lib/learn-content";

export const metadata: Metadata = {
  title: "Learn — AI News Digest",
  description: "Foundational articles on AI/ML concepts, beginner to advanced.",
};

const LEVELS: LearnLevel[] = ["beginner", "intermediate", "advanced"];
const LEVEL_LABELS: Record<LearnLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function LearnIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Learn</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        A short, beginner-to-advanced path through the concepts that show up most in the daily
        digest.
      </p>

      <div className="mt-8 space-y-8">
        {LEVELS.map((level) => {
          const articles = LEARN_ARTICLES.filter((a) => a.level === level);
          if (articles.length === 0) return null;
          return (
            <div key={level}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {LEVEL_LABELS[level]}
              </h2>
              <ul className="mt-3 space-y-4">
                {articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/learn/${article.slug}`}
                      className="text-lg font-semibold text-slate-900 hover:underline dark:text-white"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{article.teaser}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
