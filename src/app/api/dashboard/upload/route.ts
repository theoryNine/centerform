import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadVenueAsset } from "@/lib/storage";

const SKIP_CONVERSION = new Set(["svg", "gif"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const venueId = formData.get("venueId") as string | null;
  const file = formData.get("file") as File | null;

  if (!venueId || !file) {
    return NextResponse.json({ error: "Missing venueId or file" }, { status: 400 });
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

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const uniqueId = crypto.randomUUID();

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const convertToWebP = !SKIP_CONVERSION.has(ext);

  let uploadBuffer: Buffer;
  let outputExt: string;
  let contentType: string;

  if (convertToWebP) {
    uploadBuffer = await sharp(inputBuffer).webp({ quality: 85 }).toBuffer();
    outputExt = "webp";
    contentType = "image/webp";
  } else {
    uploadBuffer = inputBuffer;
    outputExt = ext;
    contentType = file.type || `image/${ext}`;
  }

  const path = `media/${uniqueId}.${outputExt}`;

  let url: string;
  try {
    url = await uploadVenueAsset(venue.slug, path, uploadBuffer, contentType);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  await supabase.from("venue_media").insert({
    venue_id: venueId,
    url,
    filename: file.name.replace(/\.[^.]+$/, `.${outputExt}`),
    size: uploadBuffer.byteLength,
  });

  return NextResponse.json({ url });
}
