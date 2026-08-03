"use client";

import { useThemeMode } from "@/lib/theme-mode";

export function ThemeToggle() {
  const { isDark, toggle } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-[26px] w-[26px] items-center justify-center rounded-[2px] border border-hairline font-mono text-[13px] text-muted hover:border-ink hover:text-ink"
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
