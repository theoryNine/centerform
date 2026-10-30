import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const maybeSingle = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a) }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

import { revalidateGuestPages } from "./revalidate";

describe("revalidateGuestPages", () => {
  beforeEach(() => {
    revalidatePath.mockReset();
    maybeSingle.mockReset();
  });

  it("revalidates the venue's slug layout", async () => {
    maybeSingle.mockResolvedValue({ data: { slug: "adam-ansel" }, error: null });
    await revalidateGuestPages("v1");
    expect(revalidatePath).toHaveBeenCalledWith("/adam-ansel", "layout");
  });

  it("does nothing when the venue has no slug", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    await revalidateGuestPages("v1");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("swallows lookup errors so a completed write isn't reported as failed", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    maybeSingle.mockResolvedValue({ data: null, error: new Error("db down") });
    await expect(revalidateGuestPages("v1")).resolves.toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
