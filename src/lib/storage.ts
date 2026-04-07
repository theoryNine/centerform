import { createAdminClient } from "@/lib/supabase/admin";

// Uploads a file to the venue-assets bucket and returns its public URL.
// path: relative path within the bucket, e.g. "places/{place-id}/photo.jpg"
// The venue slug is used as the top-level folder (mirrors the documented bucket layout).
export async function uploadVenueAsset(
  venueSlug: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createAdminClient();
  const fullPath = `${venueSlug}/${path}`;

  const { error } = await supabase.storage
    .from("venue-assets")
    .upload(fullPath, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("venue-assets").getPublicUrl(fullPath);
  return data.publicUrl;
}

// Uploads a file to the event-assets bucket and returns its public URL.
export async function uploadEventAsset(
  eventSlug: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createAdminClient();
  const fullPath = `${eventSlug}/${path}`;

  const { error } = await supabase.storage
    .from("event-assets")
    .upload(fullPath, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("event-assets").getPublicUrl(fullPath);
  return data.publicUrl;
}

// Deletes a file from the venue-assets bucket by its full storage path.
export async function deleteVenueAsset(fullPath: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("venue-assets").remove([fullPath]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
