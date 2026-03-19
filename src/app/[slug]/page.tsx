"use client";

import { useSlug } from "@/components/slug-context";
import { VenueHomePage } from "@/components/guest/venue-home";
import { EventHomePage } from "@/components/guest/event-home";

export default function SlugHomePage() {
  const resolved = useSlug();

  if (resolved.type === "event") {
    return <EventHomePage />;
  }

  return <VenueHomePage />;
}
