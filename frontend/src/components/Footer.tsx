"use client";

import { useState } from "react";

// Visual only, by design — not wired to any backend. Building real email
// capture (subscriber storage, eventually a sending service) is new
// infrastructure worth a deliberate decision, not a side effect of a
// visual redesign.
export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-hairline bg-card">
      <div className="mx-auto flex w-full max-w-[700px] flex-wrap items-center justify-between gap-5 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs tracking-wide text-muted">
            One email each morning. No hype.
          </p>
          <a
            href="/feed.xml"
            className="font-mono text-[11px] font-medium tracking-[0.06em] text-muted uppercase hover:text-ink"
          >
            RSS feed &rarr;
          </a>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full overflow-hidden border border-hairline sm:w-auto"
        >
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-0 flex-1 bg-card px-3.5 py-2 font-mono text-xs text-ink outline-none"
          />
          <button
            type="submit"
            className="border-l border-hairline bg-ink px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.07em] whitespace-nowrap text-bg uppercase"
          >
            Subscribe
          </button>
        </form>
      </div>
    </footer>
  );
}
