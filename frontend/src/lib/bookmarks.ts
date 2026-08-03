"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "bookmarked-items";

// Save-for-later, browser-only (no accounts) — same useSyncExternalStore/
// localStorage pattern as read-progress.ts and learn-progress.ts. Unlike
// read-tracking, this is always an explicit click (BookmarkButton), never
// automatic.
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

function parseBookmarks(raw: string): Set<number> {
  try {
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

export function useBookmarks() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const bookmarked = parseBookmarks(raw);

  function toggleBookmark(id: number) {
    const next = new Set(bookmarked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    notifyListeners();
  }

  return { bookmarked, toggleBookmark };
}
