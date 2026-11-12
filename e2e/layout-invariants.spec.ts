import { expect, test, type Page } from "@playwright/test";
import { PAGES, SLUG } from "./pages";

/**
 * Structural checks that need no screenshot baselines: they hold at every width, on every page.
 * (Pixel checks for phone live in phone-unchanged.spec.ts.)
 */

const SIZES = [
  { width: 360, height: 800 },
  { width: 466, height: 900 },
  { width: 600, height: 900 },
  { width: 626, height: 890 },
  { width: 700, height: 900 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 844, height: 390 }, // phone in landscape
];

async function open(page: Page, path: string) {
  await page.addInitScript((key) => localStorage.setItem(key, "1"), `splash-dismissed:${SLUG}`);
  await page.goto(path);
  await page.waitForFunction(() => !document.querySelector("svg.animate-spin"));
  await page.waitForTimeout(250);
}

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size, reducedMotion: "reduce" });

    for (const { name, path } of PAGES) {
      test(`${name}: structure`, async ({ page }) => {
        await open(page, path);

        const r = await page.evaluate(() => {
          const visible = (e: Element) => {
            const cs = getComputedStyle(e);
            return (
              cs.display !== "none" &&
              cs.visibility !== "hidden" &&
              !e.closest("[inert]") &&
              !e.closest('[aria-hidden="true"]') &&
              !e.closest("nextjs-portal") &&
              e.getClientRects().length > 0
            );
          };
          const vw = document.documentElement.clientWidth;

          // Anything poking out of the viewport sideways (ignoring fixed bars and scroll rows).
          const overflowing: string[] = [];
          for (const el of document.querySelectorAll("body *")) {
            if (el.closest("nextjs-portal") || el.closest(".overflow-x-auto")) continue;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.position === "fixed") continue;
            const rc = el.getBoundingClientRect();
            if (rc.width && rc.right > vw + 1)
              overflowing.push(`${el.tagName}.${String(el.className).slice(0, 40)}`);
          }

          const levels = [...document.querySelectorAll("h1,h2,h3,h4")]
            .filter(visible)
            .map((h) => +h.tagName[1]);
          const skipsLevel = levels.some((l, i) => i > 0 && l > levels[i - 1] + 1);

          const controls = [...document.querySelectorAll("a, button")].filter(visible);
          const unnamed = controls
            .filter(
              (e) =>
                !(
                  e.textContent?.trim() ||
                  e.getAttribute("aria-label") ||
                  e.getAttribute("aria-labelledby") ||
                  e.querySelector("img[alt]:not([alt=''])")
                ),
            )
            .map((e) => e.outerHTML.slice(0, 80));
          // WCAG 2.2 target size (minimum): 24x24 CSS px.
          const tooSmall = controls
            .filter((e) => {
              const rc = e.getBoundingClientRect();
              return rc.width < 24 || rc.height < 24;
            })
            .map(
              (e) =>
                `${(e.textContent?.trim() || e.getAttribute("aria-label") || e.tagName).slice(0, 30)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`,
            );

          return {
            scrollW: document.documentElement.scrollWidth,
            vw,
            overflowing: overflowing.slice(0, 3),
            h1Count: levels.filter((l) => l === 1).length,
            skipsLevel,
            levels: levels.join(""),
            mains: document.querySelectorAll("main").length,
            title: document.title,
            unnamed,
            tooSmall,
          };
        });

        expect(r.scrollW, "horizontal scroll").toBeLessThanOrEqual(r.vw);
        expect(r.overflowing, "elements past the right edge").toEqual([]);
        expect(r.h1Count, "visible h1s").toBe(1);
        expect(r.skipsLevel, `heading levels ${r.levels}`).toBe(false);
        expect(r.mains, "<main> landmarks").toBe(1);
        expect(r.title, "document title").not.toBe("Centerform");
        expect(r.title.length, "document title").toBeGreaterThan(0);
        expect(r.unnamed, "controls without an accessible name").toEqual([]);
        expect(r.tooSmall, "controls under 24x24").toEqual([]);
      });
    }
  });
}

// The back arrow must sit in exactly the same place on every page at a given width, so moving
// between pages never makes it jump.
const BACK_PAGES = ["services", "dining", "explore", "place", "guide", "date-night", "area"];

for (const width of [390, 640, 820, 1024, 1440]) {
  test(`back arrow position is identical across pages @${width}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const positions: Record<string, string> = {};
    for (const name of BACK_PAGES) {
      const { path } = PAGES.find((p) => p.name === name)!;
      const page = await context.newPage();
      await open(page, path);
      positions[name] = await page.evaluate(() => {
        for (const el of document.querySelectorAll("a, button")) {
          const svg = el.querySelector("svg.lucide-arrow-left");
          const cs = getComputedStyle(el);
          // skip the floating button over place photos, hidden controls and the off-screen slide-down nav
          if (
            !svg ||
            cs.display === "none" ||
            el.getClientRects().length === 0 ||
            /\bz-40\b/.test(el.className) ||
            el.closest("[inert]")
          )
            continue;
          const rc = svg.getBoundingClientRect();
          return `${Math.round(rc.left + rc.width / 2)},${Math.round(rc.top + rc.height / 2 + window.scrollY)}`;
        }
        return "none";
      });
      await page.close();
    }
    await context.close();
    const distinct = new Set(Object.values(positions));
    expect(distinct.size, JSON.stringify(positions)).toBe(1);
  });
}

// Rendered text must reach WCAG AA contrast against the background it is actually drawn on, in
// both color schemes. Measured from computed styles, so it covers venue theming and every token.
for (const colorScheme of ["dark", "light"] as const) {
  for (const width of [390, 1440]) {
    test.describe(`text contrast, ${colorScheme}, ${width}px`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme, reducedMotion: "reduce" });

      for (const { name, path } of PAGES) {
        test(name, async ({ page }) => {
          await open(page, path);
          const failures = await page.evaluate(() => {
            type Rgba = { r: number; g: number; b: number; a: number };
            const parse = (c: string): Rgba => {
              const m = c.match(/rgba?\(([^)]+)\)/);
              if (!m) return { r: 0, g: 0, b: 0, a: 0 };
              const [r, g, b, a = 1] = m[1]
                .split(/[ ,/]+/)
                .filter(Boolean)
                .map(Number);
              return { r, g, b, a };
            };
            const over = (top: Rgba, under: Rgba): Rgba => {
              const a = top.a + under.a * (1 - top.a);
              const mix = (t: number, u: number) =>
                (t * top.a + u * under.a * (1 - top.a)) / (a || 1);
              return { r: mix(top.r, under.r), g: mix(top.g, under.g), b: mix(top.b, under.b), a };
            };
            const lum = ({ r, g, b }: Rgba) => {
              const f = (v: number) => {
                const c = v / 255;
                return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
              };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            const ratio = (a: Rgba, b: Rgba) => {
              const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
              return (hi + 0.05) / (lo + 0.05);
            };

            // Background actually behind an element: opaque layers up the tree, composited.
            // Returns null when a gradient/photo or fixed overlay makes it unmeasurable.
            const backgroundOf = (el: Element): Rgba | null => {
              const layers: Rgba[] = [];
              for (let e: Element | null = el; e; e = e.parentElement) {
                const cs = getComputedStyle(e);
                if (cs.position === "fixed" || +cs.opacity < 1) return null;
                if (cs.backgroundImage !== "none") return null;
                const c = parse(cs.backgroundColor);
                if (c.a > 0) layers.push(c);
                if (c.a >= 0.99) break;
              }
              return layers.reduceRight<Rgba>((under, top) => over(top, under), {
                r: 255,
                g: 255,
                b: 255,
                a: 1,
              });
            };

            const out: string[] = [];
            for (const el of document.querySelectorAll("body *")) {
              if (el.closest("nextjs-portal, [inert], [aria-hidden='true'], svg, script, style"))
                continue;
              const cs = getComputedStyle(el);
              if (
                cs.display === "none" ||
                cs.visibility === "hidden" ||
                el.getClientRects().length === 0
              )
                continue;
              const text = [...el.childNodes]
                .filter((n) => n.nodeType === 3)
                .map((n) => n.textContent?.trim() ?? "")
                .join(" ")
                .trim();
              if (!text) continue;
              const bg = backgroundOf(el);
              if (!bg) continue;
              const fg = over(parse(cs.color), bg);
              const size = parseFloat(cs.fontSize);
              const bold = +cs.fontWeight >= 700;
              const large = size >= 24 || (bold && size >= 18.66);
              const need = large ? 3 : 4.5;
              const got = ratio(fg, bg);
              if (got < need)
                out.push(
                  `"${text.slice(0, 28)}" ${got.toFixed(2)} < ${need} (${cs.color} on rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}))`,
                );
            }
            return [...new Set(out)];
          });
          expect(failures, "text below AA contrast").toEqual([]);
        });
      }
    });
  }
}

// Guards the link styling itself. A contrast check can't notice if `text-link` silently stops
// applying (white text on dark passes contrast), so assert links are really brand-colored.
for (const colorScheme of ["dark", "light"] as const) {
  test.describe(`links are brand colored, ${colorScheme}`, () => {
    test.use({ viewport: { width: 390, height: 900 }, colorScheme, reducedMotion: "reduce" });

    for (const { name, path } of PAGES) {
      test(name, async ({ page }) => {
        await open(page, path);
        const r = await page.evaluate(() => {
          const body = getComputedStyle(document.body).color;
          const links = [...document.querySelectorAll(".text-link")].filter(
            (e) => e.getClientRects().length > 0 && !e.closest("[inert]"),
          );
          return {
            count: links.length,
            plain: links
              .filter((e) => getComputedStyle(e).color === body)
              .map((e) => (e.textContent?.trim() || e.tagName).slice(0, 30)),
          };
        });
        expect(r.plain, "text-link elements rendering in the plain body color").toEqual([]);
      });
    }
  });
}
