import { notFound } from "next/navigation";
import { resolveSlug } from "@/lib/slug-resolver";
import {
  getVenueEvents,
  getVenueNavSublabels,
  getVenueNavImages,
  getCruiseDailyWelcomes,
  getCruiseLinks,
  getCruiseNavTiles,
} from "@/lib/queries";
import { VenueHomePage } from "@/components/guest/venue/venue-home";
import { EventHomePage } from "@/components/guest/event/event-home";
import { CruiseHomePage } from "@/components/guest/cruise/cruise-home";

export default async function SlugHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);
  if (!resolved) notFound();

  if (resolved.type === "event") {
    return <EventHomePage />;
  }

  const venueId = resolved.data.id;

  if (resolved.data.venue_type === "cruise") {
    const [dailyWelcomes, links, navTiles] = await Promise.all([
      getCruiseDailyWelcomes(venueId),
      getCruiseLinks(venueId),
      getCruiseNavTiles(venueId),
    ]);
    return <CruiseHomePage dailyWelcomes={dailyWelcomes} links={links} navTiles={navTiles} />;
  }

  const [events, navSublabels, navImages] = await Promise.all([
    getVenueEvents(venueId),
    getVenueNavSublabels(venueId),
    getVenueNavImages(venueId),
  ]);
  return <VenueHomePage events={events} navSublabels={navSublabels} navImages={navImages} />;
}
