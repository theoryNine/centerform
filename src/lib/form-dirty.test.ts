import { describe, expect, it } from "vitest";
import { changedFields, unsavedLabel } from "./form-dirty";

describe("changedFields", () => {
  it("is empty when nothing changed", () => {
    expect(changedFields({ a: "1", b: "2" }, { a: "1", b: "2" })).toEqual([]);
  });

  it("lists changed, added and removed fields", () => {
    expect(changedFields({ a: "1", b: "2" }, { a: "x", c: "3" }).sort()).toEqual(["a", "b", "c"]);
  });

  it("treats a missing field and an empty string as the same", () => {
    expect(changedFields({ a: "" }, {})).toEqual([]);
    expect(changedFields({}, { a: "" })).toEqual([]);
  });
});

describe("unsavedLabel", () => {
  it("pluralises", () => {
    expect(unsavedLabel(1)).toBe("1 unsaved change");
    expect(unsavedLabel(3)).toBe("3 unsaved changes");
  });
});
