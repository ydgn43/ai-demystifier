"use client";

import { useEffect, useState } from "react";
import { FeedCard } from "@/components/FeedCard";
import { EmptyState } from "@/components/EmptyState";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { useBookmarks } from "@/lib/bookmarks";
import { ACCENT_CASUAL } from "@/lib/theme";
import type { FeedItem } from "@/lib/types";

// Bookmark ids only exist in this browser's localStorage, so — unlike every
// other page — this can't be a server component fetching by query params.
// It resolves ids to real content via /api/items, which proxies to the
// backend server-side (same reason /search's BACKEND_API_URL stays there).
export default function BookmarksPage() {
  const { bookmarked } = useBookmarks();
  const ids = [...bookmarked].reverse(); // most recently saved first
  const idsKey = ids.join(",");

  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setItems(null);
    fetch(`/api/items?ids=${idsKey}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`))))
      .then((data: FeedItem[]) => {
        if (cancelled) return;
        // Preserve save order — the backend has no reason to know it.
        const order = new Map(ids.map((id, i) => [id, i]));
        data.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        setItems(data);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load bookmarks.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <h1 className="mt-8 font-sans text-2xl font-semibold text-ink">Bookmarks</h1>
      <p className="mt-1 font-sans text-sm text-muted">
        Saved in this browser only — click ☆ Save on any item to add it here.
      </p>

      <div className="mt-6">
        {error ? (
          <EmptyState message="Could not load bookmarks." hint={error} />
        ) : ids.length === 0 ? (
          <EmptyState message="No bookmarks yet." hint="Save something from the feed to see it here." />
        ) : items === null ? (
          <FeedSkeleton />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <FeedCard key={item.id} item={item} level="casual" accentColor={ACCENT_CASUAL} animKey={0} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
