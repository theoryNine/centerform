"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signInWithMagicLink(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your email address." };
  }

  try {
    await signIn("resend", {
      email,
      redirectTo: "/dashboard",
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

// Dev-only: credentials sign-in (not available in production).
export async function signInWithCredentials(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Sign-in failed. Check your credentials." };
    }
    throw error;
  }
}
