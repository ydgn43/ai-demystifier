import Link from "next/link";
import type { FeedItem } from "@/lib/types";
import { renderWithGlossary } from "@/lib/glossary";
import { formatDate } from "@/lib/date";

const CATEGORY_STYLES: Record<string, string> = {
  Models: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  Research: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  "Developer Tools": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "Industry News": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function FeedCard({
  item,
  level,
  isRead,
  onToggleRead,
}: {
  item: FeedItem;
  level: "casual" | "developer";
  // Read/unread is opt-in — only the Timeline wires these up. Feed/Search
  // render exactly as before when they're omitted.
  isRead?: boolean;
  onToggleRead?: () => void;
}) {
  const body = level === "developer" ? item.level2 : item.level1;
  const date = formatDate(item.published_at);

  return (
    <li className={`py-6 ${isRead ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2 text-xs">
        {onToggleRead && (
          <button
            type="button"
            onClick={onToggleRead}
            aria-label={isRead ? "Mark as unread" : "Mark as read"}
            className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none transition-colors ${
              isRead
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-300 text-transparent hover:border-slate-400 dark:border-slate-600"
            }`}
          >
            ✓
          </button>
        )}
        <span
          className={`rounded-full px-2 py-0.5 font-medium ${
            CATEGORY_STYLES[item.category] ??
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {item.category}
        </span>
        <span className="text-slate-400 dark:text-slate-600">{item.source}</span>
        {date && <span className="text-slate-400 dark:text-slate-600">&middot; {date}</span>}
      </div>

      <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
        <Link href={`/item/${item.id}`} className="hover:underline">
          {item.title}
        </Link>
      </h2>

      <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
        {level === "developer" ? renderWithGlossary(body) : body}
      </p>

      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
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

      <div className="mt-3 flex items-center gap-4 text-sm">
        <Link
          href={`/item/${item.id}`}
          className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:text-white dark:decoration-slate-700 dark:hover:decoration-white"
        >
          Read more &rarr;
        </Link>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          View original source
        </a>
      </div>
    </li>
  );
}
