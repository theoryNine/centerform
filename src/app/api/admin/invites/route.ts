import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

// Internal-only endpoint for generating venue invite tokens.
// Protect with ADMIN_API_KEY — never expose this to the client.
//
// Usage:
//   curl -X POST https://your-app.com/api/admin/invites \
//     -H "Authorization: Bearer $ADMIN_API_KEY" \
//     -H "Content-Type: application/json" \
//     -d '{"venueId":"<uuid>","emailHint":"owner@hotel.com"}'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  if (!ADMIN_API_KEY || authHeader !== `Bearer ${ADMIN_API_KEY}`) {
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

  if (!venueId) {
    return NextResponse.json({ error: "venueId is required" }, { status: 400 });
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
