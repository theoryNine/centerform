import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, isHex, readableOn } from "./contrast";

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  });
});

describe("readableOn", () => {
  // Links sit on the page background or on a card.
  const dark = ["#1C1A17", "#252220"];
  const light = ["#F5F0E8", "#FFFFFF"];
  const worst = (c: string, bgs: string[]) => Math.min(...bgs.map((b) => contrastRatio(c, b)));

  it("lightens the default teal on dark surfaces until it reaches 4.5:1", () => {
    const out = readableOn("#1A7A6D", dark, "lighter");
    expect(worst("#1A7A6D", dark)).toBeLessThan(4.5);
    expect(worst(out, dark)).toBeGreaterThanOrEqual(4.5);
  });

  it("leaves a color that already passes alone", () => {
    expect(readableOn("#1A7A6D", light, "darker")).toBe("#1A7A6D");
    expect(readableOn("#7CC4B4", dark, "lighter")).toBe("#7CC4B4");
  });

  it("darkens a too-light brand color on light surfaces", () => {
    const out = readableOn("#7CC4B4", light, "darker");
    expect(worst(out, light)).toBeGreaterThanOrEqual(4.5);
  });

  it("works for any venue color, including near-white on a light page", () => {
    for (const brand of ["#FF0066", "#FFD700", "#00BFFF", "#EEEEEE"]) {
      expect(worst(readableOn(brand, light, "darker"), light)).toBeGreaterThanOrEqual(4.5);
      expect(worst(readableOn(brand, dark, "lighter"), dark)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("passes non-hex values through untouched", () => {
    expect(isHex("oklch(0.5 0.1 200)")).toBe(false);
    expect(readableOn("oklch(0.5 0.1 200)", dark, "lighter")).toBe("oklch(0.5 0.1 200)");
  });
});

describe("neutral text tokens in globals.css", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  // Pull `--name: #hex` out of one block of the stylesheet.
  const tokens = (block: string) =>
    Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
  const lightTokens = tokens(css.slice(css.indexOf(":root {"), css.indexOf("@media (prefers-color-scheme: dark)")));
  const darkTokens = tokens(css.slice(css.indexOf("@media (prefers-color-scheme: dark)")));

  it.each([
    ["light", lightTokens],
    ["dark", darkTokens],
  ])("muted-foreground is AA on every surface it sits on (%s)", (_name, t) => {
    for (const surface of ["background", "card", "muted", "secondary"]) {
      if (!t[surface]) continue;
      expect(contrastRatio(t["muted-foreground"], t[surface]), surface).toBeGreaterThanOrEqual(4.5);
    }
  });
});
