import { headers } from "next/headers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Trims/lowercases and validates; returns null if invalid. Prevents duplicate users by casing.
export function normalizeEmail(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}

// Limits magic-link sends per IP and per address so the form can't be used to spam inboxes
// or burn Resend quota.
export async function allowMagicLinkSend(email: string): Promise<boolean> {
  const ip = clientIp(await headers());
  return (
    rateLimit(`magic:ip:${ip}`, 10, 10 * 60_000) &&
    rateLimit(`magic:email:${email}`, 3, 10 * 60_000)
  );
}
