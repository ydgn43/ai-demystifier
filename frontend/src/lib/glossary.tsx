import type { ReactNode } from "react";
import glossaryData from "./glossary.json";

const glossary: Record<string, string> = glossaryData;

// Longest terms first so multi-word entries (e.g. "vision-language model")
// win over shorter ones that could match inside them (e.g. "model").
const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Trailing `s?` so plain plurals (e.g. "transformers") still match their
// singular glossary entry ("transformer") without needing duplicate keys.
const matchPattern = new RegExp(
  `\\b(${terms.map((term) => `${escapeRegExp(term)}s?`).join("|")})\\b`,
  "gi",
);

// Wraps glossary terms found in `text` with a native <abbr> tooltip. Matching
// happens against the static glossary, not per-item LLM output, per CLAUDE.md.
export function renderWithGlossary(text: string): ReactNode {
  return text.split(matchPattern).map((part, i) => {
    const lower = part.toLowerCase();
    const definition = glossary[lower] ?? glossary[lower.replace(/s$/, "")];
    if (!definition) {
      return part;
    }
    return (
      <abbr
        key={i}
        title={definition}
        className="cursor-help underline decoration-dotted decoration-slate-400 underline-offset-2"
      >
        {part}
      </abbr>
    );
  });
}
