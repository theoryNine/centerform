import { describe, expect, it } from "vitest";
import {
  cleanBlocks,
  detailsForStorage,
  emptyBlock,
  parseServiceDetails,
  parseServiceDetailsJson,
  serializeServiceDetails,
} from "./service-details";

// Shaped like the rows in production: an array of text and bullets blocks.
const productionArray = [
  { type: "text", content: "The ship has 17 decks, but here's an overview:" },
  { type: "bullets", items: ["Deck 5 - Restaurants and Spa", "Deck 17 - Jogging track"] },
  { type: "text", content: "Closing paragraph." },
];

describe("parseServiceDetails", () => {
  it("reads an array of blocks", () => {
    const r = parseServiceDetails(productionArray);
    expect(r).toEqual({ ok: true, blocks: productionArray });
  });

  it("reads a single block (the type allows one or an array)", () => {
    expect(parseServiceDetails({ type: "text", content: "Hi" })).toEqual({
      ok: true,
      blocks: [{ type: "text", content: "Hi" }],
    });
  });

  it("treats null, undefined and empty as no blocks", () => {
    expect(parseServiceDetails(null)).toEqual({ ok: true, blocks: [] });
    expect(parseServiceDetails(undefined)).toEqual({ ok: true, blocks: [] });
    expect(parseServiceDetails("")).toEqual({ ok: true, blocks: [] });
    expect(parseServiceDetails([])).toEqual({ ok: true, blocks: [] });
  });

  it("reads key/value rows with and without the copy flag, and phone blocks", () => {
    const blocks = [
      {
        type: "kv",
        rows: [
          { label: "Network", value: "Guest" },
          { label: "Password", value: "abc", copy: true },
        ],
      },
      { type: "phone", label: "Front desk", value: "+1 206 555 0123" },
    ];
    expect(parseServiceDetails(blocks)).toEqual({ ok: true, blocks });
  });

  it.each([
    ["an unknown block type", [{ type: "video", url: "x" }]],
    ["a text block without content", [{ type: "text" }]],
    ["bullets that are not strings", [{ type: "bullets", items: [1, 2] }]],
    ["kv rows that are not objects", [{ type: "kv", rows: ["a"] }]],
    ["a non-boolean copy flag", [{ type: "kv", rows: [{ label: "a", value: "b", copy: "yes" }] }]],
    ["a phone block missing its value", [{ type: "phone", label: "x" }]],
    ["a bare string", "just text"],
    ["a number", 5],
    ["one bad block among good ones", [{ type: "text", content: "ok" }, { type: "nope" }]],
  ])("rejects %s", (_name, input) => {
    expect(parseServiceDetails(input).ok).toBe(false);
  });

  it("says which block is wrong", () => {
    const r = parseServiceDetails([{ type: "text", content: "ok" }, { type: "nope" }]);
    expect(r.ok === false && r.reason).toMatch(/Block 2/);
  });
});

describe("parseServiceDetailsJson", () => {
  it("parses JSON text", () => {
    expect(parseServiceDetailsJson(JSON.stringify(productionArray))).toEqual({
      ok: true,
      blocks: productionArray,
    });
    expect(parseServiceDetailsJson("   ")).toEqual({ ok: true, blocks: [] });
  });

  it("reports invalid JSON", () => {
    const r = parseServiceDetailsJson("{not json");
    expect(r.ok).toBe(false);
  });
});

describe("round trip: parse, edit, serialize", () => {
  it("reproduces production-shaped data exactly", () => {
    const parsed = parseServiceDetails(productionArray);
    expect(parsed.ok && JSON.parse(serializeServiceDetails(parsed.blocks))).toEqual(
      productionArray,
    );
  });

  it("upgrades a single block to an array on save", () => {
    const parsed = parseServiceDetails({ type: "text", content: "Hi" });
    expect(parsed.ok && JSON.parse(serializeServiceDetails(parsed.blocks))).toEqual([
      { type: "text", content: "Hi" },
    ]);
  });

  it("keeps an edit and leaves the other blocks alone", () => {
    const parsed = parseServiceDetails(productionArray);
    if (!parsed.ok) throw new Error("should parse");
    const edited = parsed.blocks.map((b, i) =>
      i === 1 && b.type === "bullets" ? { ...b, items: [...b.items, "New bullet"] } : b,
    );
    const out = JSON.parse(serializeServiceDetails(edited));
    expect(out[0]).toEqual(productionArray[0]);
    expect(out[1].items).toEqual([
      "Deck 5 - Restaurants and Spa",
      "Deck 17 - Jogging track",
      "New bullet",
    ]);
    expect(out[2]).toEqual(productionArray[2]);
  });

  it("serializes to an empty string when there is nothing", () => {
    expect(serializeServiceDetails([])).toBe("");
  });
});

describe("cleanBlocks", () => {
  it("drops empty blocks and rows and trims text", () => {
    expect(
      cleanBlocks([
        { type: "text", content: "  hello  " },
        { type: "text", content: "   " },
        { type: "bullets", items: ["a ", "", "  "] },
        { type: "bullets", items: [""] },
        {
          type: "kv",
          rows: [
            { label: " Wi-Fi ", value: " Guest ", copy: true },
            { label: "", value: "" },
          ],
        },
        { type: "kv", rows: [{ label: "", value: "" }] },
        { type: "phone", label: "Desk", value: " 123 " },
        { type: "phone", label: "Desk", value: "" },
      ]),
    ).toEqual([
      { type: "text", content: "hello" },
      { type: "bullets", items: ["a"] },
      { type: "kv", rows: [{ label: "Wi-Fi", value: "Guest", copy: true }] },
      { type: "phone", label: "Desk", value: "123" },
    ]);
  });

  it("a freshly added empty block saves as nothing", () => {
    expect(
      serializeServiceDetails([
        emptyBlock("text"),
        emptyBlock("bullets"),
        emptyBlock("kv"),
        emptyBlock("phone"),
      ]),
    ).toBe("");
  });
});

describe("detailsForStorage (server)", () => {
  it("returns a cleaned array, or null for nothing", () => {
    expect(detailsForStorage(JSON.stringify(productionArray))).toEqual(productionArray);
    expect(detailsForStorage("")).toBeNull();
    expect(detailsForStorage('[{"type":"text","content":"  "}]')).toBeNull();
  });

  it("throws on invalid JSON or invalid blocks", () => {
    expect(() => detailsForStorage("{oops")).toThrow(/not valid/i);
    expect(() => detailsForStorage('[{"type":"video"}]')).toThrow(/not valid/i);
  });
});
