import { resolveSlug } from "@/lib/slug-resolver";
import { getCruiseRestaurantById } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseRestaurantListing } from "@/components/guest/cruise-restaurant-listing";

export default async function RestaurantListingPage({
  params,
}: {
  params: Promise<{ slug: string; restaurantId: string }>;
}) {
  const { slug, restaurantId } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue" || resolved.data.venue_type !== "cruise") {
    notFound();
  }

  const restaurant = await getCruiseRestaurantById(restaurantId);

  if (!restaurant || restaurant.venue_id !== resolved.data.id) {
    notFound();
  }

  return (
    <CruiseRestaurantListing venue={resolved.data} restaurant={restaurant} slug={slug} />
  );
}
