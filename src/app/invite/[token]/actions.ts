"use server";

import { signIn } from "@/lib/auth";
import { getInviteByToken } from "@/lib/invites";
import { AuthError } from "next-auth";

export async function requestMagicLink(
  token: string,
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your email address." };
  }

  // Re-validate the invite is still claimable before sending the magic link.
  const invite = await getInviteByToken(token);
  if (!invite) return { error: "This invite link is invalid." };

  const now = new Date().toISOString();
  if (invite.expires_at < now) return { error: "This invite link has expired." };
  if (invite.claimed_by !== null) return { error: "This invite has already been used." };

  try {
    // The invite token is embedded in redirectTo so it survives the email round-trip.
    // NextAuth signs the callbackUrl into the verification token — no cookie needed.
    await signIn("resend", {
      email,
      redirectTo: `/invite/claim?token=${encodeURIComponent(token)}`,
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Failed to send magic link. Please try again." };
    }
    // Re-throw — Next.js implements redirects as thrown errors (NEXT_REDIRECT).
    throw error;
  }
}
