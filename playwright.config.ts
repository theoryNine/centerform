import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  // Baselines are generated locally from the remote Supabase data and are not committed.
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: {
    // Playwright's default per-pixel threshold (0.2) quietly accepts real color changes, so it is
    // tightened to 0.02: that ignores 1-level rasterization noise in soft shadows but still flags a
    // text or link color shift. maxDiffPixels 0 means no pixel above the threshold may differ.
    // E2E_THRESHOLD=0.2 gives the old lax comparison: layout shifts only, colors ignored.
    toHaveScreenshot: { threshold: Number(process.env.E2E_THRESHOLD ?? 0.02), maxDiffPixels: 0 },
  },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    colorScheme: "dark",
    reducedMotion: "reduce",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
