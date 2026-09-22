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
const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, {
    error: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Add it to your .env.local (see .env.local.example).",
  }),
  CLERK_SECRET_KEY: z.string().min(1, {
    error: "CLERK_SECRET_KEY is not set. Add it to your .env.local (see .env.local.example).",
  }),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
});
