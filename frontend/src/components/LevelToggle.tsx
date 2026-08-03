"use client";

import type { Level } from "@/lib/types";

const LEVELS: Level[] = ["casual", "developer"];

const MODE_LABEL: Record<Level, string> = {
  casual: "Plain language, no jargon",
  developer: "Specs, numbers, and tradeoffs",
};

export function LevelToggle({
  level,
  onChange,
  accentColor,
  showLabel = false,
  fullWidth = false,
}: {
  level: Level;
  onChange: (l: Level) => void;
  accentColor: string;
  showLabel?: boolean;
  fullWidth?: boolean;
}) {
  const slideRight = level === "developer";

  return (
    <div className={`flex flex-col items-center gap-2 ${fullWidth ? "w-full" : ""}`}>
      <div
        className={`relative flex overflow-hidden font-mono text-xs font-semibold tracking-[0.09em] transition-colors duration-200 ${
          fullWidth ? "w-full" : "inline-flex rounded-[3px]"
        }`}
        style={{ border: `1px solid ${accentColor}` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/2 transition-transform duration-200 ease-out"
          style={{
            background: accentColor,
            transform: slideRight ? "translateX(100%)" : "translateX(0%)",
          }}
        />
        {LEVELS.map((opt) => {
          const isActive = level === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`relative z-10 text-center uppercase transition-colors duration-200 ${
                fullWidth ? "flex-1 py-3" : "min-w-[130px] px-8 py-2.5"
              }`}
              style={{ color: isActive ? "#FFFFFF" : accentColor }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span
          className="font-mono text-[10px] tracking-wide opacity-75 transition-colors duration-200"
          style={{ color: accentColor }}
        >
          {MODE_LABEL[level]}
        </span>
      )}
    </div>
  );
}
