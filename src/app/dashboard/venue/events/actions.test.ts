import { beforeEach, describe, expect, it, vi } from "vitest";

// The action itself is what's under test; stub the auth/Supabase layer it sits on.
const insert = vi.fn(async () => ({ error: null }));
const update = vi.fn();
const eqVenue = vi.fn(async () => ({ error: null }));
vi.mock("@/lib/venue-action", () => ({
  authorizeVenue: vi.fn(async () => ({
    userId: "u1",
    role: "staff",
    supabase: {
      from: () => ({
        insert,
        update: (...a: unknown[]) => {
          update(...a);
          return { eq: () => ({ eq: eqVenue }) };
        },
      }),
    },
  })),
  finishVenueWrite: vi.fn(async () => {}),
}));

import { upsertVenueEventAction } from "./actions";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  fd.set("venueId", "venue-1");
  fd.set("title", "Live Jazz");
  fd.set("start_time", "2026-12-05T19:00");
  fd.set("end_time", "");
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  insert.mockClear();
  update.mockClear();
  eqVenue.mockClear();
});

describe("upsertVenueEventAction time validation", () => {
  it("saves a valid event with the submitted wall-clock strings unchanged", async () => {
    await upsertVenueEventAction(form({ end_time: "2026-12-05T21:00" }));
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        venue_id: "venue-1",
        start_time: "2026-12-05T19:00",
        end_time: "2026-12-05T21:00",
      }),
    );
  });

  it("stores an empty end time as null", async () => {
    await upsertVenueEventAction(form({}));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ end_time: null }));
  });

  it.each([
    ["a missing start", { start_time: "" }, /start/i],
    ["an impossible start", { start_time: "2026-02-30T10:00" }, /start/i],
    ["a garbage end", { end_time: "tomorrow" }, /end time is invalid/i],
    ["an end before the start", { end_time: "2026-12-05T18:00" }, /after the start/i],
    ["an end equal to the start", { end_time: "2026-12-05T19:00" }, /after the start/i],
    ["a blank title", { title: "   " }, /title/i],
  ])("rejects %s without writing", async (_name, fields, message) => {
    await expect(upsertVenueEventAction(form(fields))).rejects.toThrow(message);
    expect(insert).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("scopes an edit to the venue", async () => {
    await upsertVenueEventAction(form({ id: "evt-1" }));
    expect(update).toHaveBeenCalledTimes(1);
    expect(eqVenue).toHaveBeenCalledWith("venue_id", "venue-1");
  });
});
