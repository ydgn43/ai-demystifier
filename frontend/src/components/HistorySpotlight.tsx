import Link from "next/link";
import { HISTORY_MILESTONES } from "@/lib/history-content";

// Milestone `date` strings only have year or year+month precision (see
// history-content.ts) — none are day-accurate, so there's no way to
// honestly show something that happened "on this day." Instead: a
// deterministic pick that cycles through all 39 milestones by day-of-year,
// stable for a given calendar day, labeled "From AI history" rather than
// implying a real on-this-day match.
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function HistorySpotlight() {
  const milestone = HISTORY_MILESTONES[dayOfYear(new Date()) % HISTORY_MILESTONES.length];

  return (
    <div className="border border-hairline bg-card p-4 sm:px-5 sm:py-4">
      <div className="mb-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wide text-muted">
        <span className="rounded-[2px] border border-hairline px-[5px] py-[1px] text-[9px] tracking-[0.07em] uppercase">
          From AI history
        </span>
        <span>{milestone.date}</span>
      </div>
      <p className="font-sans text-sm font-semibold text-ink">{milestone.title}</p>
      <p className="mt-1 font-sans text-sm leading-[1.5] text-muted">{milestone.blurb}</p>
      <Link
        href="/timeline"
        className="mt-2 inline-block font-mono text-[11px] font-medium tracking-[0.06em] text-muted uppercase hover:underline"
      >
        See the full history &rarr;
      </Link>
    </div>
  );
}
