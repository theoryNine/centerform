import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn(async () => ({ error: null }));
const update = vi.fn();
vi.mock("@/lib/venue-action", () => ({
  authorizeVenue: vi.fn(async () => ({
    userId: "u1",
    role: "staff",
    supabase: {
      from: () => ({
        insert,
        update: (p: unknown) => {
          update(p);
          return { eq: () => ({ eq: async () => ({ error: null }) }) };
        },
      }),
    },
  })),
  nextDisplayOrder: vi.fn(async () => 3),
  finishVenueWrite: vi.fn(async () => {}),
}));

import { upsertServiceAction } from "./actions";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  fd.set("venueId", "venue-1");
  fd.set("name", "Wi-Fi");
  fd.set("category", "concierge");
  fd.set("is_active", "true");
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  insert.mockClear();
  update.mockClear();
});

describe("upsertServiceAction details", () => {
  it("stores valid blocks as a cleaned array", async () => {
    const details = JSON.stringify([
      { type: "text", content: "  Hello  " },
      { type: "bullets", items: ["a", ""] },
    ]);
    await upsertServiceAction(form({ details }));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        details: [
          { type: "text", content: "Hello" },
          { type: "bullets", items: ["a"] },
        ],
      }),
    );
  });

  it("upgrades a single block to an array", async () => {
    await upsertServiceAction(form({ details: JSON.stringify({ type: "text", content: "Hi" }) }));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ details: [{ type: "text", content: "Hi" }] }),
    );
  });

  it("stores null when there is nothing to save", async () => {
    await upsertServiceAction(form({ details: "" }));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ details: null }));
  });

  it("rejects details that are not valid blocks, without writing", async () => {
    await expect(upsertServiceAction(form({ details: '[{"type":"video"}]' }))).rejects.toThrow(
      /not valid/i,
    );
    await expect(upsertServiceAction(form({ details: "{oops" }))).rejects.toThrow(/not valid/i);
    expect(insert).not.toHaveBeenCalled();
  });

  it("leaves the stored details alone when the editor could not show them (details_keep)", async () => {
    await upsertServiceAction(form({ id: "svc-1", details: "", details_keep: "true" }));
    const payload = update.mock.calls[0][0] as Record<string, unknown>;
    expect("details" in payload).toBe(false);
    expect(payload.name).toBe("Wi-Fi");
  });

  it("requires a name", async () => {
    await expect(upsertServiceAction(form({ name: "   " }))).rejects.toThrow(/Name is required/);
    expect(insert).not.toHaveBeenCalled();
  });

  it("keeps the existing icon when editing (the sheet has no icon field)", async () => {
    await upsertServiceAction(form({ id: "svc-1", icon: "wifi", details: "" }));
    expect(update.mock.calls[0][0]).toMatchObject({ icon: "wifi" });
  });
});
