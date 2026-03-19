import { createClient } from "@/lib/supabase/server";
import type { SlugResolution } from "@/types";

export async function resolveSlug(slug: string): Promise<SlugResolution | null> {
  const supabase = await createClient();

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
}
