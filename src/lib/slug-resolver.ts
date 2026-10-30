import { cache } from "react";
import { createPublicClient as createClient } from "@/lib/supabase/public";
import type { SlugResolution } from "@/types";

// cache() dedupes the lookup between the layout and the page within one render.
export const resolveSlug = cache(async function resolveSlug(
  slug: string,
): Promise<SlugResolution | null> {
  const supabase = createClient();

  // Try venues first
  const { data: venue } = await supabase
    .from("venues")
    .select("*, venue_themes(*)")
    .eq("slug", slug)
    .single();

  if (venue) {
    return { type: "venue", data: venue };
  }

  // Try standalone events
  const { data: event } = await supabase
    .from("standalone_events")
    .select("*, standalone_event_themes(*)")
    .eq("slug", slug)
    .single();

  if (event) {
    return { type: "event", data: event };
  }

  return null;
});
