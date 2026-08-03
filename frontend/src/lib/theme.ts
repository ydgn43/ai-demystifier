import type { Level } from "./types";

// The two accents are structural, not decorative: which one is live tracks
// the casual/developer toggle everywhere on the site. This is the only
// place color does real work in the design — see mockup/src/imports/pasted_text.
// CSS var references (not literal hex) so these stay correct under the
// `.dark` class override in globals.css without any light/dark branching here.
export const ACCENT_CASUAL = "var(--accent-casual)";
export const ACCENT_DEV = "var(--accent-dev)";

export function accentColorFor(level: Level): string {
  return level === "developer" ? ACCENT_DEV : ACCENT_CASUAL;
}
