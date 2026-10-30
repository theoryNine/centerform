"use client";

import { useSlug } from "@/components/slug-context";
import { VenueHomePage } from "@/components/guest/venue/venue-home";
import { EventHomePage } from "@/components/guest/event/event-home";
import { CruiseHomePage } from "@/components/guest/cruise/cruise-home";

export default function SlugHomePage() {
  const resolved = useSlug();

  if (resolved.type === "event") {
    return <EventHomePage />;
  }

  if (resolved.type === "venue" && resolved.data.venue_type === "cruise") {
    return <CruiseHomePage />;
  }

  return <VenueHomePage />;
}
