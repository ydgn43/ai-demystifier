import Link from "next/link";
import type { FeedItem, Level } from "@/lib/types";
import { renderWithGlossary } from "@/lib/glossary";
import { formatDate } from "@/lib/date";

export function FeedCard({
  item,
  level,
  accentColor,
  animKey,
  isRead,
}: {
  item: FeedItem;
  level: Level;
  accentColor: string;
  // Bumped by the parent on every toggle flip so the summary's fade-in
  // remounts and replays, instead of just silently swapping text.
  animKey: number;
  // Read/unread is opt-in — only Timeline/Feed wire this up. Set
  // automatically when the item's detail page is visited, not toggled here.
  isRead?: boolean;
}) {
  const body = level === "developer" ? item.level2 : item.level1;
  const date = formatDate(item.published_at);
  const meta = [item.source, date].filter(Boolean).join(" · ");

  return (
    <li className={`border border-hairline bg-card p-4 sm:px-5 sm:py-[15px] ${isRead ? "opacity-60" : ""}`}>
      <div className="mb-[7px] flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wide text-muted">
        <span className="rounded-[2px] border border-hairline px-[5px] py-[1px] text-[9px] tracking-[0.07em] text-muted">
          {item.category.toUpperCase()}
        </span>
        <span>{meta}</span>
      </div>

      <h2 className="mb-2 font-sans text-lg font-semibold leading-[1.3] text-ink">
        <Link href={`/item/${item.id}`} className="hover:underline">
          {item.headline}
        </Link>
      </h2>

      <p
        key={`${item.id}-${animKey}`}
        className="summary-fade mb-3 font-sans text-sm leading-[1.6] text-ink"
      >
        {level === "developer" ? renderWithGlossary(body, accentColor) : body}
      </p>

      <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] font-medium tracking-[0.06em]">
        <Link href={`/item/${item.id}`} className="uppercase hover:underline" style={{ color: accentColor }}>
          Read more &rarr;
        </Link>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="uppercase text-muted hover:underline"
        >
          View source &rarr;
        </a>
      </div>
    </li>
  );
}
