import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The --text-* tokens in globals.css generate font-size utilities (text-hotel-name, …). Without
// this, tailwind-merge reads them as text *colors* and silently drops one of `text-card-title-lg`
// / `text-foreground` when both are in the same string.
//
// They get their own group rather than joining "font-size": that built-in group conflicts with
// `leading-*` (real sizes like text-lg set a line-height), but these tokens set only a size, so
// `leading-tight text-hotel-name` must keep both.
const CUSTOM_TEXT_SIZES = [
  "hotel-name",
  "page-title",
  "section-heading",
  "card-title-lg",
  "card-title-md",
  "card-title-sm",
  "concierge-heading",
  "header-nav",
  "body",
  "body-sm",
  "label",
  "chip",
  "cta-button",
  "cta-link",
  "section-number",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: { "cf-text-size": [{ text: CUSTOM_TEXT_SIZES }] },
    // A later token size replaces an earlier built-in one and vice versa.
    conflictingClassGroups: { "cf-text-size": ["font-size"], "font-size": ["cf-text-size"] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * `tel:` href for a display phone number. Keeps a leading "+" so international numbers still dial
 * with their country code; everything else that isn't a digit is dropped.
 */
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${trimmed.replace(/\D/g, "")}`;
}

export function formatPrice(priceLevel: number | null): string | null {
  if (priceLevel === 0) return "FREE";
  if (!priceLevel) return null;
  return "$".repeat(priceLevel);
}
