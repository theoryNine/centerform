import { resolveSlug } from "@/lib/slug-resolver";
import { getVenueEvents, getVenuePageDescription } from "@/lib/queries";
import { notFound } from "next/navigation";
import { VenueEventsPage } from "@/components/guest/venue/venue-events";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (!resolved || resolved.type !== "venue") {
    notFound();
  }

  const [events, { body: pageDescription, heroImageUrl }] = await Promise.all([
    getVenueEvents(resolved.data.id),
    getVenuePageDescription(resolved.data.id, "events"),
  ]);

  return (
    <VenueEventsPage
      venue={resolved.data}
      events={events}
      slug={slug}
      pageDescription={pageDescription}
      heroImageUrl={heroImageUrl}
    />
  );
}
