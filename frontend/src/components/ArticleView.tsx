"use client";

import { useState } from "react";
import type { ItemDetail } from "@/lib/types";
import { renderWithGlossary } from "@/lib/glossary";

const LEVELS = ["casual", "developer"] as const;
type Level = (typeof LEVELS)[number];

const CATEGORY_STYLES: Record<string, string> = {
  Models: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  Research: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  "Developer Tools": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "Industry News": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function ArticleView({ item }: { item: ItemDetail }) {
  const [level, setLevel] = useState<Level>("casual");
  const article = level === "developer" ? item.article2 : item.article1;
  const paragraphs = article.split(/\n+/).filter((p) => p.trim().length > 0);

  return (
    <article>
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2 py-0.5 font-medium ${
            CATEGORY_STYLES[item.category] ??
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {item.category}
        </span>
        <span className="text-slate-400 dark:text-slate-600">{item.source}</span>
      </div>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {item.title}
      </h1>

      <div className="mt-4 flex gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800 w-fit">
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

      <div className="mt-6 space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{level === "developer" ? renderWithGlossary(paragraph) : paragraph}</p>
        ))}
      </div>

      {item.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-white dark:decoration-slate-700 dark:hover:decoration-white"
      >
        View original source &rarr;
      </a>
    </article>
  );
}
