import { beforeEach, describe, expect, it, vi } from "vitest";

// A recording stand-in for the Supabase query builder: every chained call is stored so the test
// can check what was written and how it was scoped.
interface Call {
  table: string;
  op: "select" | "insert" | "update" | "delete";
  payload?: Record<string, unknown>;
  filters: [string, string, unknown][];
}
const calls: Call[] = [];
let placeExists = true;

function builder(table: string) {
  const call: Call = { table, op: "select", filters: [] };
  calls.push(call);
  const result = () => {
    if (table === "nearby_places")
      return { data: placeExists ? { id: "place-1" } : null, error: null };
    if (table === "explore_collections") return { data: { id: "col-1" }, error: null };
    return { data: { id: "item-1" }, error: null };
  };
  const b = {
    select: () => b,
    eq: (c: string, v: unknown) => (call.filters.push(["eq", c, v]), b),
    neq: (c: string, v: unknown) => (call.filters.push(["neq", c, v]), b),
    insert: (p: Record<string, unknown>) => ((call.op = "insert"), (call.payload = p), b),
    update: (p: Record<string, unknown>) => ((call.op = "update"), (call.payload = p), b),
    delete: () => ((call.op = "delete"), b),
    maybeSingle: async () => result(),
    single: async () => result(),
    then: (resolve: (v: unknown) => void) => resolve(result()),
  };
  return b;
}

vi.mock("@/lib/venue-action", () => ({
  authorizeVenue: vi.fn(async () => ({ userId: "u1", role: "staff", supabase: { from: builder } })),
  nextDisplayOrder: vi.fn(async () => 9),
  finishVenueWrite: vi.fn(async () => {}),
}));

import { upsertCollectionItemAction } from "./actions";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  fd.set("venueId", "venue-1");
  fd.set("collectionId", "col-1");
  fd.set("place_id", "place-1");
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}
const itemWrites = () => calls.filter((c) => c.table === "explore_collection_items");
const demotions = () =>
  itemWrites().filter(
    (c) => c.op === "update" && c.filters.some(([, col]) => col === "is_start" || col === "is_end"),
  );

beforeEach(() => {
  calls.length = 0;
  placeExists = true;
});

describe("upsertCollectionItemAction position", () => {
  it("saves a middle stop without touching the other items", async () => {
    await upsertCollectionItemAction(form({ position: "middle" }));
    const insert = itemWrites().find((c) => c.op === "insert");
    expect(insert?.payload).toMatchObject({
      collection_id: "col-1",
      is_start: false,
      is_end: false,
    });
    expect(demotions()).toHaveLength(0);
  });

  it("saving a Start makes any other Start a regular stop, scoped to the collection", async () => {
    await upsertCollectionItemAction(form({ position: "start" }));
    expect(itemWrites().find((c) => c.op === "insert")?.payload).toMatchObject({
      is_start: true,
      is_end: false,
    });
    const [demote] = demotions();
    expect(demote.payload).toEqual({ is_start: false });
    expect(demote.filters).toEqual(
      expect.arrayContaining([
        ["eq", "collection_id", "col-1"],
        ["eq", "is_start", true],
        ["neq", "id", "item-1"],
      ]),
    );
  });

  it("saving an End does the same for End, and never sets both", async () => {
    await upsertCollectionItemAction(form({ position: "end" }));
    expect(itemWrites().find((c) => c.op === "insert")?.payload).toMatchObject({
      is_start: false,
      is_end: true,
    });
    expect(demotions()[0].payload).toEqual({ is_end: false });
  });

  it("still understands the older is_start / is_end fields", async () => {
    await upsertCollectionItemAction(form({ is_start: "true", is_end: "true" }));
    // Start wins: an item is never both.
    expect(itemWrites().find((c) => c.op === "insert")?.payload).toMatchObject({
      is_start: true,
      is_end: false,
    });
  });

  it("edits an existing item scoped to its collection", async () => {
    await upsertCollectionItemAction(form({ id: "item-1", position: "middle" }));
    const update = itemWrites().find((c) => c.op === "update");
    expect(update?.filters).toEqual(
      expect.arrayContaining([
        ["eq", "id", "item-1"],
        ["eq", "collection_id", "col-1"],
      ]),
    );
  });

  it("refuses a place that is not in this venue, without writing", async () => {
    placeExists = false;
    await expect(upsertCollectionItemAction(form({ position: "start" }))).rejects.toThrow(
      /Place not found/,
    );
    expect(itemWrites().filter((c) => c.op !== "select")).toHaveLength(0);
  });
});
