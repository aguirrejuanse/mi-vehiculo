import { z } from "zod";

/**
 * Eagerly-validated env vars needed at middleware init (proxy.ts runs on
 * every request before any route code, so a misconfigured Clerk key must
 * fail loudly here instead of surfacing as an opaque Clerk SDK error later).
 *
 * Unlike db/index.ts's DATABASE_URL (validated lazily, on first query, so
 * `next build` doesn't need a real connection string), these are required
 * synchronously by clerkMiddleware() itself, so we parse at module load.
 */
// The custom `error` message must be passed to `z.string()` itself, not just
// `.min()` — a missing env var is `undefined`, which fails the base string
// check first (and would otherwise surface Zod's generic "expected string,
// received undefined" instead of this message).
const required = (message: string) => z.string({ error: message }).min(1, { error: message });

const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: required(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Add it to your .env.local (see .env.local.example).",
  ),
  CLERK_SECRET_KEY: required(
    "CLERK_SECRET_KEY is not set. Add it to your .env.local (see .env.local.example).",
  ),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
});
