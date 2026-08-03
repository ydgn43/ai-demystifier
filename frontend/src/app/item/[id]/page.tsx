import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/api";
import { ArticleView } from "@/components/ArticleView";

// Same reasoning as the feed page — an item's content can change on
// reprocessing, so this must not be baked in as a build-time snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) {
    return {};
  }

  const result = await getItem(itemId);
  if (!result.ok) {
    return {};
  }

  const { item } = result;
  return {
    title: item.headline,
    description: item.level1,
    openGraph: {
      title: item.headline,
      description: item.level1,
      type: "article",
      publishedTime: item.published_at ?? undefined,
    },
  };
}

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
    <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-6 pb-20">
      {!result.ok ? (
        <p className="py-16 text-center font-sans text-[15px] text-muted">
          Couldn&apos;t load this item: {result.error}
        </p>
      ) : (
        <ArticleView item={result.item} />
      )}
    </div>
  );
}
