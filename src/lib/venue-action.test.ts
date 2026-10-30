import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

// venue-action imports auth/permissions/supabase modules that need env + Next runtime;
// nextDisplayOrder doesn't use them, so stub the modules out.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/permissions", () => ({ requireVenueRole: vi.fn() }));
vi.mock("@/lib/revalidate", () => ({ revalidateGuestPages: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));

import { nextDisplayOrder } from "./venue-action";

function fakeSupabase(maxOrder: number | null) {
  const calls: Array<[string, ...unknown[]]> = [];
  const chain = {
    select: (...a: unknown[]) => (calls.push(["select", ...a]), chain),
    eq: (...a: unknown[]) => (calls.push(["eq", ...a]), chain),
    order: (...a: unknown[]) => (calls.push(["order", ...a]), chain),
    limit: (...a: unknown[]) => (calls.push(["limit", ...a]), chain),
    maybeSingle: async () => ({ data: maxOrder === null ? null : { display_order: maxOrder } }),
  };
  const client = { from: (t: string) => (calls.push(["from", t]), chain) };
  return { client: client as unknown as SupabaseClient, calls };
}

describe("nextDisplayOrder", () => {
  it("uses the submitted number without querying", async () => {
    const { client, calls } = fakeSupabase(9);
    expect(await nextDisplayOrder(client, "services", "venue_id", "v1", "4")).toBe(4);
    expect(calls).toHaveLength(0);
  });

  it("appends after the current max, scoped to the given column", async () => {
    const { client, calls } = fakeSupabase(7);
    expect(await nextDisplayOrder(client, "services", "venue_id", "v1", null)).toBe(8);
    expect(calls).toContainEqual(["from", "services"]);
    expect(calls).toContainEqual(["eq", "venue_id", "v1"]);
  });

  it("starts at 1 for an empty scope, treating blank input as missing", async () => {
    const { client } = fakeSupabase(null);
    expect(await nextDisplayOrder(client, "services", "venue_id", "v1", "")).toBe(1);
  });
});

describe("authorizeVenue", () => {
  async function load() {
    vi.resetModules();
    const authMock = vi.fn();
    const requireRole = vi.fn();
    const admin = { marker: "admin-client" };
    vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
    vi.doMock("@/lib/auth", () => ({ auth: authMock }));
    vi.doMock("@/lib/permissions", () => ({ requireVenueRole: requireRole }));
    vi.doMock("@/lib/revalidate", () => ({ revalidateGuestPages: vi.fn() }));
    vi.doMock("@/lib/supabase/admin", () => ({ createAdminClient: () => admin }));
    const mod = await import("./venue-action");
    return { ...mod, authMock, requireRole, admin };
  }

  it("rejects when there is no session", async () => {
    const { authorizeVenue, authMock, requireRole } = await load();
    authMock.mockResolvedValue(null);
    await expect(authorizeVenue("v1", "staff")).rejects.toThrow("Unauthorized");
    expect(requireRole).not.toHaveBeenCalled();
  });

  it("rejects a missing venueId before checking roles", async () => {
    const { authorizeVenue, authMock, requireRole } = await load();
    authMock.mockResolvedValue({ user: { id: "u1" } });
    await expect(authorizeVenue("", "staff")).rejects.toThrow("Missing venueId");
    expect(requireRole).not.toHaveBeenCalled();
  });

  it("checks the minimum role for the signed-in user and returns the admin client", async () => {
    const { authorizeVenue, authMock, requireRole, admin } = await load();
    authMock.mockResolvedValue({ user: { id: "u1" } });
    requireRole.mockResolvedValue("admin");
    const result = await authorizeVenue("v1", "admin");
    expect(requireRole).toHaveBeenCalledWith("u1", "v1", "admin");
    expect(result).toEqual({ userId: "u1", role: "admin", supabase: admin });
  });

  it("propagates the redirect thrown when the role is insufficient", async () => {
    const { authorizeVenue, authMock, requireRole } = await load();
    authMock.mockResolvedValue({ user: { id: "u1" } });
    requireRole.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(authorizeVenue("v1", "owner")).rejects.toThrow("NEXT_REDIRECT");
  });
});
