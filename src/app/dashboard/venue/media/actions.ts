"use server";

import { auth } from "@/lib/auth";
import { getVenueRole, requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteVenueAsset } from "@/lib/storage";
import type { VenueMedia } from "@/types";

export async function listVenueMediaAction(venueId: string): Promise<VenueMedia[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const role = await getVenueRole(session.user.id, venueId);
  if (!role) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("venue_media")
    .select("*")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function deleteVenueMediaAction(mediaId: string, venueId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requireVenueRole(session.user.id, venueId, "admin");

  const supabase = createAdminClient();

  const { data: media } = await supabase
    .from("venue_media")
    .select("url")
    .eq("id", mediaId)
    .eq("venue_id", venueId)
    .single();

  if (!media) throw new Error("Not found");

  await supabase.from("venue_media").delete().eq("id", mediaId).eq("venue_id", venueId);

  // Extract storage path from the public URL and delete the file
  const pathMatch = media.url.match(/\/storage\/v1\/object\/public\/venue-assets\/(.+)/);
  if (pathMatch) {
    await deleteVenueAsset(pathMatch[1]).catch(() => {});
  }
}

// Where an image can be in use. `scope` is the column that ties the row to the venue.
const USAGE_SOURCES: { table: string; column: string; label: string; scope: "id" | "venue_id" }[] =
  [
    { table: "venues", column: "cover_image_url", label: "the cover image", scope: "id" },
    { table: "venues", column: "logo_url", label: "the logo", scope: "id" },
    {
      table: "venue_page_descriptions",
      column: "image_url",
      label: "a page image",
      scope: "venue_id",
    },
    { table: "nearby_places", column: "image_url", label: "a place", scope: "venue_id" },
    { table: "events", column: "image_url", label: "an event", scope: "venue_id" },
    { table: "cruise_restaurants", column: "image_url", label: "a restaurant", scope: "venue_id" },
    {
      table: "cruise_itinerary_items",
      column: "image_url",
      label: "an itinerary item",
      scope: "venue_id",
    },
    { table: "cruise_crew", column: "image_url", label: "a crew member", scope: "venue_id" },
    { table: "cruise_nav_images", column: "image_url", label: "a home tile", scope: "venue_id" },
  ];

/** For each URL that is in use somewhere on the venue, what it is used for ("a place", ...). */
export async function getMediaUsageAction(
  venueId: string,
  urls: string[],
): Promise<Record<string, string[]>> {
  const session = await auth();
  if (!session?.user?.id) return {};
  if (!(await getVenueRole(session.user.id, venueId))) return {};

  const wanted = [...new Set(urls)].slice(0, 200);
  if (wanted.length === 0) return {};

  const supabase = createAdminClient();
  const usage: Record<string, Set<string>> = {};
  await Promise.all(
    USAGE_SOURCES.map(async ({ table, column, label, scope }) => {
      const { data, error } = await supabase
        .from(table)
        .select(column)
        .eq(scope, venueId)
        .in(column, wanted);
      if (error || !data) return; // a table or column this database doesn't have: skip it
      for (const row of data as unknown as Record<string, string>[]) {
        (usage[row[column]] ??= new Set()).add(label);
      }
    }),
  );
  return Object.fromEntries(Object.entries(usage).map(([url, labels]) => [url, [...labels]]));
}

/** Deletes several images (library rows and files). Admins only, like the single delete. */
export async function deleteVenueMediaBulkAction(
  venueId: string,
  mediaIds: string[],
): Promise<{ deleted: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await requireVenueRole(session.user.id, venueId, "admin");

  const ids = [...new Set(mediaIds)].slice(0, 100);
  if (ids.length === 0) return { deleted: 0 };

  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("venue_media")
    .select("id, url")
    .in("id", ids)
    .eq("venue_id", venueId);
  if (!rows || rows.length === 0) return { deleted: 0 };

  const { error } = await supabase
    .from("venue_media")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id),
    )
    .eq("venue_id", venueId);
  if (error) throw new Error(error.message);

  await Promise.all(
    rows.map((r) => {
      const match = r.url.match(/\/storage\/v1\/object\/public\/venue-assets\/(.+)/);
      return match ? deleteVenueAsset(match[1]).catch(() => {}) : Promise.resolve();
    }),
  );
  return { deleted: rows.length };
}
