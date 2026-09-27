import { test as base } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

// Every context gets the Clerk testing token so headless Chrome bypasses bot
// protection on the dev instance's Frontend API — required even for "public"
// pages, since ClerkProvider loads ClerkJS everywhere.
export const test = base.extend({
  context: async ({ context }, use) => {
    await setupClerkTestingToken({ context });
    await use(context);
  },
});

export { expect } from "@playwright/test";
