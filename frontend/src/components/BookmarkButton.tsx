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
      className={`font-mono text-[11px] font-medium tracking-[0.06em] uppercase transition-colors ${
        isBookmarked ? "text-ink" : "text-muted hover:text-ink"
      } ${className}`}
    >
      {isBookmarked ? "★ Saved" : "☆ Save"}
    </button>
  );
}
