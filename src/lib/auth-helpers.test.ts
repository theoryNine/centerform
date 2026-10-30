import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { normalizeEmail } from "./auth-helpers";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Ansel@Example.COM ")).toBe("ansel@example.com");
  });

  it.each(["", "no-at-sign", "a@b", "a b@c.com", "@c.com"])("rejects %j", (value) => {
    expect(normalizeEmail(value)).toBeNull();
  });

  it("rejects non-string form values", () => {
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail(new File([], "x"))).toBeNull();
  });

  it("rejects addresses longer than 254 characters", () => {
    expect(normalizeEmail(`${"a".repeat(250)}@x.com`)).toBeNull();
  });
});
