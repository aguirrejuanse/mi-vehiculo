import { clerkSetup } from "@clerk/testing/playwright";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { ensureUser, e2eDatabaseUrl, SEEDED_USER_EMAIL } from "./helpers";

const execFileAsync = promisify(execFile);
// Anchor the seed script to the repo root — Playwright resolves its config
// upward, so `playwright test` can be invoked from a subdirectory.
const REPO_ROOT = resolve(__dirname, "..");

// Projects that never read the seeded garage — smoke checks public pages
// and auth/wizard specs create their own users. Anything not listed here
// (dashboard, screenshots, a new project, a --project glob) gets the seed:
// failing toward seeding is safe, skipping it is not.
const UNSEEDED_PROJECTS = new Set(["smoke", "e2e"]);

// Playwright's --project is variadic (`--project a b`) and also comes in
// `--project=name` form — collect values until the next -flagged arg.
function requestedProjects(): string[] {
  const projects: string[] = [];
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === "--project") {
      while (process.argv[i + 1] && !process.argv[i + 1].startsWith("-")) {
        projects.push(process.argv[++i]);
      }
    } else if (arg.startsWith("--project=")) {
      projects.push(arg.slice("--project=".length));
    }
  }
  return projects.filter(Boolean);
}

// Ensures the dashboard test user exists in the Clerk dev instance and its
// garage is freshly seeded, so dashboard specs always run against a known
// data set (scripts/seed.ts --fresh deletes that user's rows first).
export default async function globalSetup() {
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  // Unconditional: the e2e project's sign-in spec uses the seeded email.
  const userId = await ensureUser(SEEDED_USER_EMAIL);

  const requested = requestedProjects();
  const needsSeed =
    requested.length === 0 ||
    requested.some((name) => !UNSEEDED_PROJECTS.has(name));
  if (!needsSeed) return;

  const databaseUrl = e2eDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run seeded e2e tests");
  }
  await execFileAsync("node", ["scripts/seed.ts", userId, "--fresh"], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
