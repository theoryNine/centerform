import { describe, expect, it } from "vitest";
import { cn, formatPrice, telHref } from "./utils";

describe("telHref", () => {
  it("strips formatting but keeps a leading +", () => {
    expect(telHref("+1 (206) 555-0123")).toBe("tel:+12065550123");
    expect(telHref("(206) 555-0123")).toBe("tel:2065550123");
    expect(telHref("  206.555.0123 ")).toBe("tel:2065550123");
  });

  it("does not let non-digits through", () => {
    expect(telHref('555"><script>')).toBe("tel:555");
  });
});

describe("cn", () => {
  it("keeps custom text-size tokens next to a text color", () => {
    expect(cn("text-card-title-lg text-foreground")).toBe("text-card-title-lg text-foreground");
    expect(cn("text-foreground text-hotel-name")).toBe("text-foreground text-hotel-name");
  });

  it("does not treat a token size as setting line-height", () => {
    expect(cn("leading-tight text-foreground text-page-title")).toBe(
      "leading-tight text-foreground text-page-title",
    );
  });

  it("still lets a later size replace an earlier one", () => {
    expect(cn("text-body text-body-sm")).toBe("text-body-sm");
    expect(cn("text-body text-lg")).toBe("text-lg");
    expect(cn("text-lg text-body")).toBe("text-body");
  });

  it("still lets a later color replace an earlier one", () => {
    expect(cn("text-foreground text-primary")).toBe("text-primary");
  });
});

describe("formatPrice", () => {
  it("formats levels", () => {
    expect(formatPrice(0)).toBe("FREE");
    expect(formatPrice(3)).toBe("$$$");
    expect(formatPrice(null)).toBeNull();
  });
});
