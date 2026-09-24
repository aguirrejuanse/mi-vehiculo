import { clerkSetup } from "@clerk/testing/playwright";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ensureUser, e2eDatabaseUrl, SEEDED_USER_EMAIL } from "./helpers";

const execFileAsync = promisify(execFile);

// Only these projects read the seeded garage — smoke and auth/wizard specs
// create their own users, so seeding for them is a pointless destructive
// write against the shared dev DB on every run.
const SEEDED_PROJECTS = new Set(["dashboard", "screenshots"]);

function requestedProjects(): string[] {
  return process.argv.flatMap((arg, i, argv) => {
    if (arg === "--project") return [argv[i + 1]];
    if (arg.startsWith("--project=")) return [arg.slice("--project=".length)];
    return [];
  });
}

// Ensures the dashboard test user exists in the Clerk dev instance and its
// garage is freshly seeded, so dashboard specs always run against a known
// data set (scripts/seed.ts --fresh deletes that user's rows first).
export default async function globalSetup() {
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const userId = await ensureUser(SEEDED_USER_EMAIL);

  const requested = requestedProjects();
  const needsSeed =
    requested.length === 0 ||
    requested.some((name) => SEEDED_PROJECTS.has(name));
  if (!needsSeed) return;

  const databaseUrl = e2eDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run seeded e2e tests");
  }
  await execFileAsync("node", ["scripts/seed.ts", userId, "--fresh"], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
