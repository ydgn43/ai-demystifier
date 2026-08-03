import type { Level } from "./types";

// The two accents are structural, not decorative: which one is live tracks
// the casual/developer toggle everywhere on the site. This is the only
// place color does real work in the design — see mockup/src/imports/pasted_text.
export const ACCENT_CASUAL = "#C2410C";
export const ACCENT_DEV = "#1F52E0";

export function accentColorFor(level: Level): string {
  return level === "developer" ? ACCENT_DEV : ACCENT_CASUAL;
}
