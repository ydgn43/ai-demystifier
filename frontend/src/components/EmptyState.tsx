export function EmptyState({
  message = "Nothing here yet.",
  hint,
}: {
  message?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
      <div className="mb-2 w-12 border-t border-hairline" />
      <p className="font-sans text-[17px] font-medium leading-[1.4] text-ink">{message}</p>
      {hint && <p className="font-mono text-[11px] tracking-wide text-muted">{hint}</p>}
    </div>
  );
}
