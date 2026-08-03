"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "timeline-read-items";

// Read/unread tracking, shared by the homepage feed and the Timeline —
// the same inbox-style pattern RSS readers and email clients use. No
// accounts exist, so this lives in the browser only. useSyncExternalStore
// is React's own recommended way to sync with an external store like
// localStorage, and avoids setState-inside-useEffect.
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

function parseRead(raw: string): Set<number> {
  try {
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

export function useReadProgress() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const readItems = parseRead(raw);

  function toggleRead(id: number) {
    const next = new Set(readItems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    notifyListeners();
  }

  return { readItems, toggleRead };
}
