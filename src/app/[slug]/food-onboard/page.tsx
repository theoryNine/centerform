import { resolveSlug } from "@/lib/slug-resolver";
import { getCruiseRestaurants, getVenuePageDescription } from "@/lib/queries";
import { notFound } from "next/navigation";
import { CruiseFoodOnboardPage } from "@/components/guest/cruise-food-onboard";

export default async function FoodOnboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue" || resolved.data.venue_type !== "cruise") {
    notFound();
  }

  const [restaurants, pageDescription] = await Promise.all([
    getCruiseRestaurants(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "food-onboard"),
  ]);

  return (
    <CruiseFoodOnboardPage
      venue={resolved.data}
      restaurants={restaurants}
      slug={slug}
      pageDescription={pageDescription}
    />
  );
}
