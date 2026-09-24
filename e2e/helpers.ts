import { clerk } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

// Clerk dev instances verify any `+clerk_test` email with this fixed code —
// no real email delivery needed.
export const TEST_OTP_CODE = "424242";
export const SEEDED_USER_EMAIL = "e2e-dashboard+clerk_test@example.com";

// Signs the seeded user in through a Backend-API sign-in ticket. Done per
// test instead of via storageState on purpose: Clerk's `__session` JWT lives
// ~60s, so a stored cookie silently expires mid-suite and a later SPA
// navigation lands on /ingresar. A fresh ticket per test (~1-2s) removes
// that whole class of flakes.
export async function signInSeededUser(page: Page): Promise<void> {
  await page.goto("/ingresar");
  await clerk.signIn({ page, emailAddress: SEEDED_USER_EMAIL });
}

const CLERK_API = "https://api.clerk.com/v1";

function clerkHeaders() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is required to run e2e tests");
  }
  return {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };
}

type ClerkUser = {
  id: string;
  email_addresses: { email_address: string }[];
};

export async function listUsersByEmailQuery(
  query: string,
): Promise<ClerkUser[]> {
  const res = await fetch(
    `${CLERK_API}/users?email_address_query=${encodeURIComponent(query)}&limit=100`,
    { headers: clerkHeaders() },
  );
  if (!res.ok) {
    throw new Error(`Clerk user list failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function findUserByEmail(
  email: string,
): Promise<ClerkUser | undefined> {
  const users = await listUsersByEmailQuery(email);
  return users.find((user) =>
    user.email_addresses.some(
      (entry) => entry.email_address.toLowerCase() === email.toLowerCase(),
    ),
  );
}

export async function ensureUser(email: string): Promise<string> {
  const existing = await findUserByEmail(email);
  if (existing) return existing.id;

  const res = await fetch(`${CLERK_API}/users`, {
    method: "POST",
    headers: clerkHeaders(),
    body: JSON.stringify({
      email_address: [email],
      skip_password_requirement: true,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Clerk create user failed: ${res.status} ${await res.text()}`,
    );
  }
  const user = (await res.json()) as ClerkUser;
  return user.id;
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${CLERK_API}/users/${userId}`, {
    method: "DELETE",
    headers: clerkHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Clerk delete user failed: ${res.status}`);
  }
}

// Deleting a vehicle cascades to maintenance types, logs, edits and parts.
export async function deleteVehiclesForUsers(userIds: string[]): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || userIds.length === 0) return;
  const sql = neon(databaseUrl);
  await sql`DELETE FROM vehicles WHERE user_id = ANY(${userIds})`;
}
