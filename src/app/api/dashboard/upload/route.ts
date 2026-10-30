import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadVenueAsset } from "@/lib/storage";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 2400;
// SVG is deliberately excluded: it can carry scripts and is served from our storage origin.
// Everything else (including GIF) is re-encoded by sharp, which also strips metadata.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const formData = await req.formData();
  const venueId = formData.get("venueId") as string | null;
  const file = formData.get("file") as File | null;

  if (!venueId || !file) {
    return NextResponse.json({ error: "Missing venueId or file" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const role = await getVenueRole(session.user.id, venueId);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: venue } = await supabase
    .from("venues")
    .select("slug")
    .eq("id", venueId)
    .single();

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const uniqueId = crypto.randomUUID();
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // Always re-encode: validates the bytes really are an image (sharp throws otherwise),
  // applies EXIF orientation, caps resolution, and strips embedded metadata.
  let uploadBuffer: Buffer;
  try {
    uploadBuffer = await sharp(inputBuffer, { limitInputPixels: 100_000_000, animated: true })
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Invalid or unsupported image" }, { status: 415 });
  }
  const outputExt = "webp";
  const contentType = "image/webp";

  const path = `media/${uniqueId}.${outputExt}`;

  let url: string;
  try {
    url = await uploadVenueAsset(venue.slug, path, uploadBuffer, contentType);
  } catch (err) {
    console.error("Venue upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  await supabase.from("venue_media").insert({
    venue_id: venueId,
    url,
    filename: file.name.replace(/\.[^.]+$/, `.${outputExt}`),
    size: uploadBuffer.byteLength,
  });

  return NextResponse.json({ url });
}
