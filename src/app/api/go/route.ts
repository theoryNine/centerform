import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeHttpUrl } from "@/lib/url";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Redirects to a place/event booking URL and records the click for affiliate reporting.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("place");
  const eventId = searchParams.get("event");

  const entityId = placeId ?? eventId;
  if (!entityId || !UUID.test(entityId)) return new Response("Not found", { status: 404 });

  const ip = clientIp(request.headers);
  // Always redirect, but only count clicks inside the rate limit (stops stat inflation / table spam).
  const countClick = rateLimit(`go:${ip}:${entityId}`, 3, 60_000) && rateLimit(`go:${ip}`, 60, 60_000);

  const supabase = await createClient();
  const isPlace = Boolean(placeId);

  const { data } = await supabase
    .from(isPlace ? "nearby_places" : "events")
    .select("booking_url, venue_id")
    .eq("id", entityId)
    .single();

  const target = safeHttpUrl(data?.booking_url);
  if (!data || !target) return new Response("Not found", { status: 404 });

  if (countClick) {
    // Fire-and-forget — don't block the redirect on the insert
    createAdminClient()
      .from("affiliate_clicks")
      .insert({
        entity_type: isPlace ? "place" : "event",
        entity_id: entityId,
        venue_id: data.venue_id,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to record affiliate click", error.message);
      });
  }

  return Response.redirect(target, 302);
}
