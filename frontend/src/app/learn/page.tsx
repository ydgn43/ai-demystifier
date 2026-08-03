import type { Metadata } from "next";
import { LEARN_ARTICLES } from "@/lib/learn-content";
import { LearnIndexClient } from "@/components/learn/LearnIndexClient";

export const metadata: Metadata = {
  title: "Learn — AI News Digest",
  description: "Foundational articles on AI/ML concepts, beginner to advanced.",
};

export default function LearnIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-20 sm:px-6">
      <h1 className="mt-8 font-sans text-2xl font-semibold text-ink">Learn</h1>
      <p className="mt-1 font-sans text-sm text-muted">
        A short, beginner-to-advanced path through the concepts that show up most in the daily
        digest.
      </p>

      <div className="mt-6">
        <LearnIndexClient articles={LEARN_ARTICLES} />
      </div>
    </div>
  );
}
