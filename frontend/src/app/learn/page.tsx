import type { Metadata } from "next";
import { LEARN_ARTICLES } from "@/lib/learn-content";
import { LearnIndexClient } from "@/components/learn/LearnIndexClient";

export const metadata: Metadata = {
  title: "Learn — AI News Digest",
  description: "Foundational articles on AI/ML concepts, beginner to advanced.",
};

export default function LearnIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Learn</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        A short, beginner-to-advanced path through the concepts that show up most in the daily
        digest.
      </p>

      <div className="mt-6">
        <LearnIndexClient articles={LEARN_ARTICLES} />
      </div>
    </div>
  );
}
