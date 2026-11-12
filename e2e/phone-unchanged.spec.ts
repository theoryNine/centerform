import { expect, test, type Page } from "@playwright/test";

/**
 * Guards the "phone layout must not change" rule for the responsive work.
 *
 * Workflow: on a clean `develop` checkout run `pnpm e2e:baseline` to write the baselines,
 * then on the feature branch run `pnpm e2e` — any pixel difference at or below 599px fails.
 * Baselines live in e2e/__screenshots__ (gitignored; they depend on the remote Supabase data).
 */

const SLUG = "the-ballard-inn";
const MARKET_ID = "b1a2c3d4-0000-4000-a000-000000000101";
const CAFE_ID = "b1a2c3d4-0000-4000-a000-000000000103";
const WALK_COLLECTION_ID = "b1a2c3d4-0000-4000-a000-000000000201";

const PAGES = [
  { name: "home", path: `/${SLUG}` },
  { name: "services", path: `/${SLUG}/services` },
  { name: "dining", path: `/${SLUG}/dining` },
  { name: "explore", path: `/${SLUG}/explore` },
  { name: "place", path: `/${SLUG}/explore/place/${MARKET_ID}` },
  { name: "dine-place", path: `/${SLUG}/explore/place/${CAFE_ID}` },
  { name: "guide", path: `/${SLUG}/explore/${WALK_COLLECTION_ID}` },
];

const WIDTHS = [360, 390, 430, 599];

async function settle(page: Page) {
  // Full-screen LoadingSpinner(s) cover the page until images load (a page can mount several).
  await page.waitForFunction(() => !document.querySelector("svg.animate-spin"));
  await page.evaluate(() =>
    Promise.all(
      // Skip images in display:none subtrees (e.g. lazy cards hidden at this width) — they never load.
      Array.from(document.images)
        .filter((img) => img.offsetParent !== null)
        .map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))),
    ),
  );
}

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });

    for (const { name, path } of PAGES) {
      test(name, async ({ page }) => {
        // Skip the one-time welcome splash and pin the clock (the home page picks "today's events").
        await page.addInitScript(
          (key) => localStorage.setItem(key, "1"),
          `splash-dismissed:${SLUG}`,
        );
        await page.clock.setFixedTime(new Date("2026-01-15T12:00:00-08:00"));
        await page.goto(path);
        await settle(page);
        await expect(page).toHaveScreenshot(`${name}-${width}.png`, {
          fullPage: true,
          stylePath: "e2e/hide-dev-overlay.css",
          maxDiffPixels: 0,
        });
      });
    }
  });
}

// Scrolled viewport shots cover the chrome that is hidden at scroll 0: the scroll-reveal header
// on place pages, the Services section nav, and the sticky list-page header border.
const SCROLLED_PAGES = ["services", "dining", "place", "dine-place", "guide"];

for (const width of [390, 599]) {
  test.describe(`${width}px scrolled`, () => {
    test.use({ viewport: { width, height: 844 } });

    for (const name of SCROLLED_PAGES) {
      test(name, async ({ page }) => {
        const { path } = PAGES.find((p) => p.name === name)!;
        await page.addInitScript(
          (key) => localStorage.setItem(key, "1"),
          `splash-dismissed:${SLUG}`,
        );
        await page.clock.setFixedTime(new Date("2026-01-15T12:00:00-08:00"));
        await page.goto(path);
        await settle(page);
        await page.evaluate(() => window.scrollTo(0, 700));
        await page.waitForTimeout(300);
        await expect(page).toHaveScreenshot(`${name}-${width}-scrolled.png`, {
          stylePath: "e2e/hide-dev-overlay.css",
          maxDiffPixels: 0,
        });
      });
    }
  });
}

// The first-visit welcome splash (an overlay, so a viewport shot). Unlike the page tests above this
// does NOT pre-dismiss it: a fresh context has no `splash-dismissed:<slug>` flag.
for (const width of WIDTHS) {
  test.describe(`${width}px splash`, () => {
    test.use({ viewport: { width, height: 844 } });

    test("welcome splash", async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-01-15T12:00:00-08:00"));
      await page.goto(`/${SLUG}`);
      await page.getByRole("dialog", { name: "Welcome" }).waitFor();
      await settle(page);
      await expect(page).toHaveScreenshot(`splash-${width}.png`, {
        stylePath: "e2e/hide-dev-overlay.css",
        maxDiffPixels: 0,
      });
    });
  });
}
