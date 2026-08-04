"use client";

import { useBookmarks } from "@/lib/bookmarks";

// Self-contained (reads its own state via useBookmarks) rather than prop-
// driven, so it can be dropped into FeedCard as-is — FeedCard itself is
// rendered from both server components (search, learn related-items) and
// client ones, and this way it doesn't need to become a client component.
export function BookmarkButton({ itemId, className = "" }: { itemId: number; className?: string }) {
  const { bookmarked, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarked.has(itemId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(itemId);
      }}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Remove bookmark" : "Save for later"}
      className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium tracking-[0.06em] uppercase transition-colors ${
        isBookmarked ? "text-ink" : "text-muted hover:text-ink"
      } ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        width="12"
        height="12"
        aria-hidden="true"
        fill={isBookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      >
        <path d="M4 2h8v12l-4-3-4 3V2z" />
      </svg>
      {isBookmarked ? "Saved" : "Save"}
    </button>
  );
}
