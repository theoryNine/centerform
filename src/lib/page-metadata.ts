import type { Metadata } from "next";
import { resolveSlug } from "@/lib/slug-resolver";

/**
 * Document title for a guest page: "<page> · <venue or event name>" (just the name on the home
 * page). Every guest page used to share the site title, which gives screen-reader and tab users no
 * way to tell pages apart (WCAG 2.4.2). `resolveSlug` is cached per request, so this adds no query.
 */
export async function pageMetadata(slug: string, page?: string): Promise<Metadata> {
  const resolved = await resolveSlug(slug);
  const title = [page, resolved?.data.name].filter(Boolean).join(" · ");
  return title ? { title } : {};
}
