import { defineConfig, defaultExclude } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "node",
    // `*.spec.ts` is Playwright territory — vitest would try to run them and
    // blow up on test.beforeEach outside its runner.
    exclude: [...defaultExclude, "e2e/**"],
  },
});
