import { describe, expect, it } from "vitest";
import { parseOptionalHttpUrl, safeHttpUrl } from "./url";

describe("safeHttpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(safeHttpUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(safeHttpUrl("http://example.com")).toBe("http://example.com/");
  });

  it("trims surrounding whitespace", () => {
    expect(safeHttpUrl("  https://example.com  ")).toBe("https://example.com/");
  });

  it.each(["javascript:alert(1)", "data:text/html,<script>", "ftp://example.com", "//evil.com", "not a url", ""])(
    "rejects %j",
    (value) => {
      expect(safeHttpUrl(value)).toBeNull();
    },
  );

  it("returns null for null/undefined", () => {
    expect(safeHttpUrl(null)).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
  });
});

describe("parseOptionalHttpUrl", () => {
  it("turns empty or missing input into null", () => {
    expect(parseOptionalHttpUrl(null, "Website")).toBeNull();
    expect(parseOptionalHttpUrl("   ", "Website")).toBeNull();
  });

  it("returns the trimmed original for a valid URL", () => {
    expect(parseOptionalHttpUrl(" https://example.com ", "Website")).toBe("https://example.com");
  });

  it("throws with the field label for invalid input", () => {
    expect(() => parseOptionalHttpUrl("javascript:alert(1)", "Booking URL")).toThrow(
      "Booking URL must be a valid http(s) URL.",
    );
  });
});
