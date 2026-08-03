"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

// Mirrors whatever ThemeScript (in layout.tsx) already applied to <html> on
// first paint, so there's no flash/mismatch on mount — this hook only takes
// over from that point onward.
function getSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean {
  return false;
}

export function useThemeMode() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    notifyListeners();
  }

  return { isDark, toggle };
}
