import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Guest pages under /[slug] are cached (ISR). Call this after any dashboard write that can
// change what guests see so the venue's pages regenerate on their next request instead of
// waiting for the time-based revalidate window.
//
// Best-effort: it runs after the write has already succeeded, so a failure here must not make
// the action look failed. The time-based revalidate window is the fallback.
export async function revalidateGuestPages(venueId: string): Promise<void> {
  try {
    const { data, error } = await createAdminClient()
      .from("venues")
      .select("slug")
      .eq("id", venueId)
      .maybeSingle();
    if (error) throw error;
    if (data?.slug) revalidatePath(`/${data.slug}`, "layout");
  } catch (err) {
    console.error("Failed to revalidate guest pages for venue", venueId, err);
  }
}
