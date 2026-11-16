import { describe, expect, it } from "vitest";
import { parseVenueTab } from "./venue-tabs";

describe("parseVenueTab", () => {
  it("accepts the known tabs", () => {
    expect(parseVenueTab("images")).toBe("images");
    expect(parseVenueTab("branding")).toBe("branding");
    expect(parseVenueTab("general")).toBe("general");
  });

  it("falls back to general for missing or unknown values", () => {
    expect(parseVenueTab(undefined)).toBe("general");
    expect(parseVenueTab("nope")).toBe("general");
  });

  it("uses the first value when the param is repeated", () => {
    expect(parseVenueTab(["images", "branding"])).toBe("images");
  });
});
