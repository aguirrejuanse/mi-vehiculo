# Mi Vehículo

Vehicle maintenance tracker — register your car, motorcycle, bike or
skateboard and keep every service up to date, tracked by kilometers or
hours of use.

**Live demo:** https://mi-vehiculo-chi.vercel.app

## What it does

- **Vehicle garage** — multiple vehicles per account, each with its own
  maintenance plan and history.
- **Maintenance log** — record services (oil, brakes, tires, …) against
  km or hours, with full edit history per log entry.
- **Public onboarding wizard** — `/nuevo` lets a first-time visitor spec
  their vehicle before signing up.
- **Auth** — Clerk with inline email-code sign-in (`/ingresar`).
- **Product analytics** — PostHog events proxied through `/_posthog` so
  ad blockers don't drop them; gated per-environment so local traffic
  never pollutes prod data.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Drizzle ORM + Neon
Postgres · Clerk · Tailwind 4 · PostHog · Vitest + Playwright · pnpm

## Getting started

Requires pnpm, a Neon database and a Clerk application.

```bash
cp .env.local.example .env.local   # fill in DATABASE_URL + Clerk keys
pnpm install
pnpm db:migrate                    # apply drizzle migrations
pnpm db:seed                       # optional: demo data covering all UI states
pnpm dev                           # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | yes | Clerk secret key |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin for metadata (auto-resolved on Vercel) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | no | Product analytics — events are skipped silently if absent |
| `NEXT_PUBLIC_POSTHOG_ENV` | no | `dev`/`preview`/`prod` tag on events |

Other useful scripts: `pnpm db:generate` (create migrations),
`pnpm db:push` (sync schema without migration files), `pnpm db:studio`
(Drizzle Studio), `pnpm test` (Vitest), `pnpm test:e2e` (Playwright).

## Project layout

- `db/schema.ts` — `vehicles`, `maintenanceTypes`, `maintenanceLogs` and
  relations; `db/index.ts` holds a lazy Drizzle client that doesn't break
  the build when `DATABASE_URL` is missing.
- `proxy.ts` — protects everything except `/` with Clerk (Next.js 16's
  replacement for `middleware.ts`).
- `app/(landing)`, `app/(public)` — public landing and the `/nuevo` wizard.
- `app/dashboard/` — authenticated area; vehicles are filtered by the
  Clerk `userId`.
- `lib/analytics/` — PostHog client/server helpers.
- `scripts/seed.ts` — seeds every UI state for local development.
