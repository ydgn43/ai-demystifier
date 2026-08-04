import { HISTORY_ERAS, type Era, type Milestone } from "@/lib/history-content";

function bucketByEra(milestones: Milestone[]): [Era, Milestone[]][] {
  return HISTORY_ERAS.map(
    (era): [Era, Milestone[]] => [
      era,
      milestones.filter((m) => m.year >= era.startYear && m.year <= era.endYear),
    ],
  ).filter(([, eraMilestones]) => eraMilestones.length > 0);
}

function SpotlightCard({ milestone }: { milestone: Milestone }) {
  return (
    <li className="border border-hairline bg-card p-5 sm:px-6 sm:py-6">
      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wide text-muted">
        <span className="rounded-[2px] border border-hairline px-[5px] py-[1px] text-[9px] tracking-[0.07em] text-muted">
          {milestone.category.toUpperCase()}
        </span>
        <span>{milestone.date}</span>
      </div>

      <h3 className="mb-2 font-sans text-xl font-bold leading-[1.25] text-ink">{milestone.title}</h3>

      <p className="mb-3 font-sans text-sm leading-[1.6] text-ink">{milestone.blurb}</p>

      <a
        href={milestone.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[11px] font-medium tracking-[0.06em] text-muted uppercase hover:underline"
      >
        View source &rarr;
      </a>
    </li>
  );
}

function CompactRow({ milestone }: { milestone: Milestone }) {
  return (
    <li>
      <a
        href={milestone.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-baseline justify-between gap-3 py-2"
      >
        <span className="flex items-baseline gap-3 overflow-hidden">
          <span className="shrink-0 font-mono text-[10px] tracking-wide text-muted">{milestone.date}</span>
          <span className="truncate font-sans text-sm text-ink group-hover:underline">{milestone.title}</span>
        </span>
        <span className="shrink-0 font-mono text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
          &rarr;
        </span>
      </a>
    </li>
  );
}

function EraSection({ era, milestones }: { era: Era; milestones: Milestone[] }) {
  const landmarks = milestones.filter((m) => m.landmark);
  const rest = milestones.filter((m) => !m.landmark);

  return (
    <div className="relative pb-14 last:pb-0">
      <span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full border-2 border-bg bg-ink" />

      <div className="mb-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-sans text-2xl font-bold leading-tight text-ink">{era.title}</h2>
          <span className="font-mono text-xs tracking-[0.05em] text-muted uppercase">
            {era.startYear}&ndash;{era.endYear}
          </span>
        </div>
        <p className="mt-2 max-w-[560px] font-sans text-sm leading-[1.6] text-muted">{era.blurb}</p>
      </div>

      {landmarks.length > 0 && (
        <ul className="flex flex-col gap-3">
          {landmarks.map((milestone) => (
            <SpotlightCard key={milestone.title} milestone={milestone} />
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <ul className={`divide-y divide-hairline ${landmarks.length > 0 ? "mt-4" : ""}`}>
          {rest.map((milestone) => (
            <CompactRow key={milestone.title} milestone={milestone} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function HistoryTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="mt-8">
      <div className="relative border-l-2 border-hairline pl-8">
        {bucketByEra(milestones).map(([era, eraMilestones]) => (
          <EraSection key={era.title} era={era} milestones={eraMilestones} />
        ))}
      </div>
    </div>
  );
}
