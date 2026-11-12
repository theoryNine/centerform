/** WCAG contrast helpers, and a way to nudge a brand color until text in it is readable. */

type Rgb = [number, number, number];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: string): boolean {
  return HEX.test(value.trim());
}

function parseHex(hex: string): Rgb {
  let h = hex.trim().slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

function toHex([r, g, b]: Rgb): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): Rgb {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    const x = (t + 1) % 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
}

/**
 * Returns `color` unchanged if it already reaches `min` contrast against every background;
 * otherwise moves its lightness (keeping hue and saturation) in `direction` until it does.
 * Use "lighter" on dark surfaces and "darker" on light ones. Non-hex input is returned as is.
 */
export function readableOn(
  color: string,
  backgrounds: string[],
  direction: "lighter" | "darker",
  min = 4.5,
): string {
  if (!isHex(color) || backgrounds.some((b) => !isHex(b))) return color;
  const worst = (c: string) => Math.min(...backgrounds.map((b) => contrastRatio(c, b)));
  if (worst(color) >= min) return color;

  const [h, s, l] = rgbToHsl(parseHex(color));
  const step = direction === "lighter" ? 0.01 : -0.01;
  let candidate = color;
  for (let next = l + step; next >= 0 && next <= 1; next += step) {
    candidate = toHex(hslToRgb([h, s, next]));
    if (worst(candidate) >= min) return candidate;
  }
  return candidate; // as far as it can go (pure white/black)
}
