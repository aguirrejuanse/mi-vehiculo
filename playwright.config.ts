import { config as loadEnv } from "dotenv";
import { defineConfig } from "@playwright/test";

loadEnv({ path: ".env.local", quiet: true });

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Server actions + Clerk dev round-trips make the guest wizard slower than
  // a typical local E2E — keep the ceiling generous and assertions tighter.
  timeout: 90_000,
  // 30s: cold route compiles in `next dev` under parallel workers can stall
  // navigation commits well past the default 5s.
  expect: { timeout: 30_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // `next dev` compiles routes on demand — more parallel browsers starve it
  // and renderer processes get killed mid-test.
  workers: 2,
  // One local retry absorbs dev-server compile flakes without hiding real
  // regressions (retries reuse the worker, so serial specs keep module state).
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: BASE_URL,
    // System Chrome — avoids the playwright browser download entirely.
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "smoke", testMatch: "smoke/**/*.spec.ts" },
    { name: "e2e", testMatch: ["auth/**/*.spec.ts", "nuevo/**/*.spec.ts"] },
    { name: "dashboard", testMatch: "dashboard/**/*.spec.ts" },
    // Guide screenshots generator — excluded from `test:e2e` (it writes to
    // public/, not assertions); run it on demand via `pnpm screenshots`.
    {
      name: "screenshots",
      testMatch: "screenshots/**/*.spec.ts",
      // Marketing shots: mobile viewport + dark mode, retina density so the
      // PNGs stay sharp on hidpi displays.
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        colorScheme: "dark",
      },
    },
  ],
  webServer: {
    // CI builds once and serves `next start` — no per-route cold compiles,
    // which is what made dev-mode timeouts flake. Locally `next dev` keeps
    // the loop fast since routes compile on demand.
    command: process.env.CI
      ? `pnpm exec next start -p ${PORT}`
      : `pnpm exec next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
