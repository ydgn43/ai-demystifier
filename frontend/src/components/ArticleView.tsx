"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ItemDetail, Level } from "@/lib/types";
import { renderWithGlossary } from "@/lib/glossary";
import { formatDate } from "@/lib/date";
import { formatMetric } from "@/lib/metrics";
import { accentColorFor } from "@/lib/theme";
import { LevelToggle } from "@/components/LevelToggle";
import { useReadProgress } from "@/lib/read-progress";
import { BookmarkButton } from "@/components/BookmarkButton";

export function ArticleView({ item }: { item: ItemDetail }) {
  const [level, setLevel] = useState<Level>("casual");
  const [animKey, setAnimKey] = useState(0);
  const accentColor = accentColorFor(level);
  const { markRead } = useReadProgress();

  // Visiting the article is what marks it read — no manual toggle.
  useEffect(() => {
    markRead(item.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const handleLevelChange = (l: Level) => {
    setLevel(l);
    setAnimKey((k) => k + 1);
  };

  const article = level === "developer" ? item.article2 : item.article1;
  const paragraphs = article.split(/\n+/).filter((p) => p.trim().length > 0);
  const whyItMatters =
    level === "developer" ? item.why_it_matters_developer : item.why_it_matters_casual;
  const date = formatDate(item.published_at);
  const metric = formatMetric(item.source, item.metrics);
  const meta = [item.source, date, metric].filter(Boolean).join(" · ");

  return (
    <div>
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-hairline bg-bg py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-[11px] font-medium tracking-[0.06em] text-muted uppercase hover:text-ink"
          >
            &larr; Back
          </Link>
          <BookmarkButton itemId={item.id} />
        </div>
        <LevelToggle level={level} onChange={handleLevelChange} accentColor={accentColor} />
      </div>

      <div className="pt-10">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] font-medium tracking-wide text-muted">
          <span className="rounded-[2px] border border-hairline px-1.5 py-0.5 text-[10px] tracking-[0.08em] text-ink">
            {item.category.toUpperCase()}
          </span>
          <span>{meta}</span>
        </div>

        <h1 className="mb-2 font-sans text-[28px] font-semibold leading-[1.25] text-ink">
          {item.headline}
        </h1>

        <p className="mb-7 font-mono text-xs tracking-wide text-muted">{item.title}</p>

        <div className="border-t border-hairline pt-7">
          <div key={`article-${animKey}`} className="summary-fade mb-6">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="mb-6 font-sans text-[17px] leading-[1.7] text-ink last:mb-0">
                {level === "developer" ? renderWithGlossary(paragraph, accentColor) : paragraph}
              </p>
            ))}
          </div>

          <div className="mb-7 border-l-2 pl-4" style={{ borderColor: accentColor }}>
            <div
              className="mb-2 font-mono text-[10px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: accentColor }}
            >
              Why this matters
            </div>
            <p
              key={`why-${animKey}`}
              className="summary-fade font-sans text-[15px] leading-[1.6] text-muted"
            >
              {whyItMatters}
            </p>
          </div>

          <div className="mb-7 flex flex-wrap gap-2">
            {[item.category, item.source].map((tag) => (
              <span
                key={tag}
                className="rounded-[2px] border border-hairline px-2 py-[3px] font-mono text-[10px] tracking-[0.06em] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-[3px] px-5 py-2.5 font-mono text-xs font-medium tracking-[0.06em] text-white uppercase transition-colors"
            style={{ background: accentColor }}
          >
            View source &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
