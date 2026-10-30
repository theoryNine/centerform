import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Guest pages under /[slug] are cached (ISR). Call this after any dashboard write that can
// change what guests see so the venue's pages regenerate on their next request instead of
// waiting for the time-based revalidate window.
export async function revalidateGuestPages(venueId: string): Promise<void> {
  const { data } = await createAdminClient()
    .from("venues")
    .select("slug")
    .eq("id", venueId)
    .maybeSingle();
  if (data?.slug) revalidatePath(`/${data.slug}`, "layout");
}
