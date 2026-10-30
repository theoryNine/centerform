import { resolveSlug } from "@/lib/slug-resolver";
import { getCruiseItineraryItemById, getCruiseRestaurantById } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseItineraryListing } from "@/components/guest/cruise/cruise-itinerary-listing";

export default async function ItineraryItemPage({
  params,
}: {
  params: Promise<{ slug: string; itemId: string }>;
}) {
  const { slug, itemId } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue" || resolved.data.venue_type !== "cruise") {
    notFound();
  }

  const item = await getCruiseItineraryItemById(itemId);

  if (!item || item.venue_id !== resolved.data.id) {
    notFound();
  }

  const restaurant = item.restaurant_id
    ? await getCruiseRestaurantById(item.restaurant_id)
    : null;

  return (
    <CruiseItineraryListing
      venue={resolved.data}
      item={item}
      slug={slug}
      restaurantName={restaurant?.name ?? null}
    />
  );
}
