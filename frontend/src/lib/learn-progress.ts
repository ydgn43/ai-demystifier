"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "learn-progress";

// No accounts exist, so progress lives in the browser only.
// useSyncExternalStore is React's own recommended way to read a value from
// an external store like localStorage — it plays correctly with SSR (via
// getServerSnapshot) and avoids the "setState inside an effect" pattern.
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

function parseProgress(raw: string): Set<string> {
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function useLearnProgress() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const completed = parseProgress(raw);

  function toggleComplete(slug: string) {
    const next = new Set(completed);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    notifyListeners();
  }

  return { completed, toggleComplete };
}
