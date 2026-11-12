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
