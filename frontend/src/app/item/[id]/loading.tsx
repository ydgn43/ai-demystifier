export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-6 pb-20">
      <div className="mb-6 h-3 w-16 rounded-[2px] bg-hairline" />
      <div className="mt-10 h-[28px] w-3/4 rounded-[2px] bg-hairline" />
      <div className="mt-3 h-3 w-2/5 rounded-[2px] bg-hairline opacity-70" />
      <div className="mt-8 space-y-2.5 border-t border-hairline pt-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 rounded-[2px] bg-hairline opacity-70" />
        ))}
      </div>
    </div>
  );
}
