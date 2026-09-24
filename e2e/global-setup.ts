import { clerkSetup } from "@clerk/testing/playwright";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ensureUser, SEEDED_USER_EMAIL } from "./helpers";

const execFileAsync = promisify(execFile);

// Ensures the dashboard test user exists in the Clerk dev instance and its
// garage is freshly seeded, so dashboard specs always run against a known
// data set (scripts/seed.ts --fresh deletes that user's rows first).
export default async function globalSetup() {
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const userId = await ensureUser(SEEDED_USER_EMAIL);
  await execFileAsync("node", ["scripts/seed.ts", userId, "--fresh"]);
}
