import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes, timingSafeEqual } from "crypto";

// Internal-only endpoint for generating venue invite tokens.
// Protect with ADMIN_API_KEY — never expose this to the client.
//
// Usage:
//   curl -X POST https://your-app.com/api/admin/invites \
//     -H "Authorization: Bearer $ADMIN_API_KEY" \
//     -H "Content-Type: application/json" \
//     -d '{"venueId":"<uuid>","emailHint":"owner@hotel.com"}'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const VALID_ROLES = ["owner", "admin", "staff"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isAuthorized(header: string | null): boolean {
  if (!ADMIN_API_KEY || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${ADMIN_API_KEY}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    venueId?: string;
    role?: string;
    expiresInDays?: number;
    emailHint?: string;
    invitedBy?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { venueId, role = "owner", expiresInDays = 7, emailHint, invitedBy } = body;

  if (!venueId || !UUID.test(venueId)) {
    return NextResponse.json({ error: "venueId must be a valid UUID" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    return NextResponse.json({ error: "role must be owner, admin or staff" }, { status: 400 });
  }
  if (!Number.isFinite(expiresInDays) || expiresInDays < 1 || expiresInDays > 90) {
    return NextResponse.json({ error: "expiresInDays must be between 1 and 90" }, { status: 400 });
  }
  if (invitedBy !== undefined && (typeof invitedBy !== "string" || invitedBy.length > 100)) {
    return NextResponse.json({ error: "invitedBy must be a string up to 100 characters" }, { status: 400 });
  }
  if (emailHint !== undefined && (typeof emailHint !== "string" || emailHint.length > 254)) {
    return NextResponse.json({ error: "emailHint must be a string up to 254 characters" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify the venue exists
  const { data: venue } = await supabase
    .from("venues")
    .select("id, name, slug")
    .eq("id", venueId)
    .maybeSingle();

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: invite, error } = await supabase
    .from("venue_invites")
    .insert({
      venue_id: venueId,
      token,
      role,
      expires_at: expiresAt,
      email_hint: emailHint ?? null,
      invited_by: invitedBy ?? null,
    })
    .select("token, expires_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${invite.token}`;

  return NextResponse.json({
    token: invite.token,
    inviteUrl,
    expiresAt: invite.expires_at,
    venue: { id: venue.id, name: venue.name, slug: venue.slug },
  });
}
