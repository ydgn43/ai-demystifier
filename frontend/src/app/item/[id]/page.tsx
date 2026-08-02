import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/api";
import { ArticleView } from "@/components/ArticleView";

// Same reasoning as the feed page — an item's content can change on
// reprocessing, so this must not be baked in as a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itemId = Number(id);

  if (!Number.isInteger(itemId)) {
    notFound();
  }

  const result = await getItem(itemId);

  if (!result.ok && result.status === 404) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <Link
        href="/"
        className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        &larr; Back to digest
      </Link>

      {!result.ok ? (
        <p className="py-16 text-center text-red-600 dark:text-red-400">
          Couldn&apos;t load this item: {result.error}
        </p>
      ) : (
        <ArticleView item={result.item} />
      )}
    </div>
  );
}
