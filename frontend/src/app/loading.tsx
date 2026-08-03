import { FeedSkeleton } from "@/components/FeedSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-6 py-5">
      <FeedSkeleton />
    </div>
  );
}
