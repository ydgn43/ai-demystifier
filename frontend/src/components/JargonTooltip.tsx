"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function JargonTooltip({
  term,
  definition,
  accentColor,
}: {
  term: string;
  definition: string;
  accentColor: string;
}) {
  const [active, setActive] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Dismiss on tap-outside — covers both mouse and touch.
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [active]);

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setActive(true);
  }, []);

  const hide = useCallback(() => {
    hideTimer.current = setTimeout(() => setActive(false), 120);
  }, []);

  return (
    <span ref={containerRef} className="relative inline">
      <span
        className="jargon-term"
        style={{ borderBottomColor: accentColor }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onTouchStart={(e) => {
          e.preventDefault();
          if (active) {
            setActive(false);
          } else {
            show();
          }
        }}
        onClick={() => (active ? setActive(false) : show())}
        tabIndex={0}
        role="button"
        aria-expanded={active}
        aria-label={`${term}: ${definition}`}
      >
        {term}
      </span>
      {active && <span className="tooltip">{definition}</span>}
    </span>
  );
}
