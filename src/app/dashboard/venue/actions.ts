"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireVenueRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateGuestPages } from "@/lib/revalidate";
import { parseOptionalHttpUrl } from "@/lib/url";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const FONT_NAME = /^[A-Za-z0-9 ]{1,60}$/;
const CSS_LENGTH = /^\d+(\.\d+)?(rem|px|em)$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireHex(value: FormDataEntryValue | null, label: string): string {
  if (typeof value !== "string" || !HEX_COLOR.test(value)) {
    throw new Error(`${label} must be a hex color like #1a2b3c.`);
  }
  return value;
}

function optionalMatch(value: FormDataEntryValue | null, re: RegExp, label: string): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  if (!re.test(raw)) throw new Error(`${label} is invalid.`);
  return raw;
}

export async function updateVenueAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("venues")
    .update({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      phone: (formData.get("phone") as string) || null,
      email: optionalMatch(formData.get("email"), EMAIL, "Email"),
      website: parseOptionalHttpUrl(formData.get("website"), "Website"),
      cover_image_url: parseOptionalHttpUrl(formData.get("cover_image_url"), "Cover image URL"),
      welcome_heading: (formData.get("welcome_heading") as string) || null,
      welcome_body: (formData.get("welcome_body") as string) || null,
      phone_label: (formData.get("phone_label") as string) || null,
    })
    .eq("id", venueId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue");
  await revalidateGuestPages(venueId);
}

const PAGE_SLUGS = ["services", "dining", "events", "explore"] as const;

export async function updatePageImagesAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();

  const urls = PAGE_SLUGS.map((slug) => ({
    slug,
    url: parseOptionalHttpUrl(formData.get(slug), "Image URL"),
  }));

  const { data: existing } = await supabase
    .from("venue_page_descriptions")
    .select("page_slug")
    .eq("venue_id", venueId)
    .in("page_slug", [...PAGE_SLUGS]);
  const existingSlugs = new Set((existing ?? []).map((r) => r.page_slug));

  // Existing rows only get image_url updated (body is preserved); new rows are created only
  // when a URL is set. One batched read replaces the per-slug lookups.
  const results = await Promise.all(
    urls.map(({ slug, url }) => {
      if (existingSlugs.has(slug)) {
        return supabase
          .from("venue_page_descriptions")
          .update({ image_url: url })
          .eq("venue_id", venueId)
          .eq("page_slug", slug);
      }
      if (!url) return null;
      return supabase
        .from("venue_page_descriptions")
        .insert({ venue_id: venueId, page_slug: slug, body: "", image_url: url });
    }),
  );
  const failed = results.find((r) => r?.error);
  if (failed?.error) throw new Error(failed.error.message);

  revalidatePath("/dashboard/venue");
  await revalidateGuestPages(venueId);
}

export async function updateVenueThemeAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const venueId = formData.get("venueId") as string;
  await requireVenueRole(session.user.id, venueId, "staff");

  const supabase = createAdminClient();
  const { error } = await supabase.from("venue_themes").upsert(
    {
      venue_id: venueId,
      primary_color: requireHex(formData.get("primary_color"), "Primary color"),
      secondary_color: requireHex(formData.get("secondary_color"), "Secondary color"),
      accent_color: requireHex(formData.get("accent_color"), "Accent color"),
      font_family: optionalMatch(formData.get("font_family"), FONT_NAME, "Font family"),
      heading_font_family: optionalMatch(
        formData.get("heading_font_family"),
        FONT_NAME,
        "Heading font family",
      ),
      border_radius: optionalMatch(formData.get("border_radius"), CSS_LENGTH, "Border radius"),
    },
    { onConflict: "venue_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/venue");
  await revalidateGuestPages(venueId);
}
