import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — AI News Digest",
  description: "What this site is, how it works, and why it exists.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <h1 className="mt-8 font-sans text-2xl font-semibold text-ink">About</h1>
      <div className="mt-6 space-y-4 font-sans leading-relaxed text-ink">
        <p>
          AI News Digest pulls new papers, models, and tools from Hugging Face&apos;s Daily
          Papers, GitHub, and arXiv every day, and turns each one into a plain-English summary —
          no ML background required.
        </p>
        <p>
          Every item comes in two levels: a <strong>casual</strong> version for a general reader,
          and a <strong>developer</strong> version with more technical depth. Click through to any
          item for a longer article at both levels, plus a permanent link back to the original
          source.
        </p>
        <p>
          In the developer view, technical terms are underlined with a dotted line — hover (or
          tap) one to see a plain-English definition, matched against a fixed glossary rather than
          generated on the fly, so the definitions stay consistent from item to item.
        </p>
        <p>
          The feed is split into <strong>Today</strong> and <strong>Earlier this week</strong>,
          each grouped by category (Models, Research, Developer Tools, Industry News), so it reads
          more like a briefing than an endless scroll.
        </p>
        <p>
          This is an independent project and isn&apos;t affiliated with arXiv, GitHub, or Hugging
          Face — it just reads their public feeds.
        </p>
      </div>
    </div>
  );
}
