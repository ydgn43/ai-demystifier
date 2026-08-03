// Static hairline skeleton — no shimmer, matches the flat "paper" aesthetic
// instead of a glossy loading effect.
const CARDS = [
  { lines: 2 },
  { lines: 3 },
  { lines: 2 },
  { lines: 3 },
  { lines: 2 },
];

function Block({ className = "" }: { className?: string }) {
  return <div className={`rounded-[2px] bg-hairline ${className}`} />;
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {CARDS.map((card, i) => (
        <div key={i} className="border border-hairline bg-card p-4 sm:px-5 sm:py-[15px]">
          <div className="mb-[9px] flex items-center gap-2">
            <Block className="h-2 w-14 opacity-70" />
            <Block className="h-2 w-20 opacity-70" />
            <Block className="h-2 w-12 opacity-70" />
          </div>
          <Block className="mb-2.5 h-[18px] w-3/4" />
          <div className="mb-3 flex flex-col gap-1.5">
            {Array.from({ length: card.lines }).map((_, j) => (
              <Block
                key={j}
                className={`h-[9px] opacity-70 ${j === card.lines - 1 ? "w-1/2" : "w-full"}`}
              />
            ))}
          </div>
          <Block className="h-2 w-16 opacity-70" />
        </div>
      ))}
    </div>
  );
}
