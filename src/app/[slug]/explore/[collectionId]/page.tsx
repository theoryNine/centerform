import { resolveSlug } from "@/lib/slug-resolver";
import { getExploreCollectionWithItems, getExploreCollections } from "@/lib/queries";
import { notFound } from "next/navigation";
import { ExploreCollectionPage } from "@/components/guest/explore/explore-collection";
import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; collectionId: string }>;
}): Promise<Metadata> {
  const { slug, collectionId } = await params;
  const collection = await getExploreCollectionWithItems(collectionId);
  return pageMetadata(slug, collection?.title);
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string; collectionId: string }>;
}) {
  const { slug, collectionId } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const venue = resolved.data;
  const [collection, allCollections] = await Promise.all([
    getExploreCollectionWithItems(collectionId),
    getExploreCollections(venue.id),
  ]);

  if (!collection || collection.venue_id !== venue.id) {
    notFound();
  }

  const otherCollections = allCollections.filter((c) => c.id !== collectionId);

  return (
    <ExploreCollectionPage
      slug={slug}
      venue={venue}
      collection={collection}
      otherCollections={otherCollections}
    />
  );
}
