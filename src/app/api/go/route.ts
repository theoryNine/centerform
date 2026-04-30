import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("place");
  const eventId = searchParams.get("event");

  const supabase = await createClient();

  if (placeId) {
    const { data: place } = await supabase
      .from("nearby_places")
      .select("booking_url, venue_id")
      .eq("id", placeId)
      .single();

    if (!place?.booking_url) return new Response("Not found", { status: 404 });

    // Fire-and-forget — don't block the redirect on the insert
    createAdminClient()
      .from("affiliate_clicks")
      .insert({ entity_type: "place", entity_id: placeId, venue_id: place.venue_id })
      .then();

    return Response.redirect(place.booking_url, 302);
  }

  if (eventId) {
    const { data: event } = await supabase
      .from("events")
      .select("booking_url, venue_id")
      .eq("id", eventId)
      .single();

    if (!event?.booking_url) return new Response("Not found", { status: 404 });

    createAdminClient()
      .from("affiliate_clicks")
      .insert({ entity_type: "event", entity_id: eventId, venue_id: event.venue_id })
      .then();

    return Response.redirect(event.booking_url, 302);
  }

  return new Response("Not found", { status: 404 });
}
