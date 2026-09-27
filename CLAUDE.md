@AGENTS.md

## Conventions & gotchas

- `<legend>` inside a flex fieldset does not take part in `gap`: give it its own margin (see `components/ui/option-card-group.tsx`).
- Clerk returns the specific error code in `errors[0].code`; the top-level `code` is always `api_response_error`.
- Inline sign-in for existing accounts needs "Email verification code" enabled in Clerk Dashboard → Sign-in options.
- Toasts live in `components/ui/toast.tsx` (Base UI, hand-adapted from the shadcn registry). Do NOT run `shadcn init`: it overwrites project tokens (`--muted`, `--background`, `--foreground`), switches dark mode to a `.dark` class and adds `--font-sans` cycles.
- Prettier is not installed; rely on ESLint.
- Competitor research and screenshots go in `docs/competidores/<name>/`.
- Landing: component-level decorative color variants (e.g. the "dark box" pattern in pain-banner/how-it-works/final-cta/founder-quote) get their own dedicated token in `globals.css` (`--color-box*`), never reuse semantic tokens (`--foreground`/`--background`) — reusing them breaks the pattern whenever the theme changes for unrelated reasons.
- Branch flow: `feature → dev → master`. PRs target `dev`. CI (`.github/workflows/ci.yml`) applies Drizzle migrations to the matching Neon branch on push to `dev`/`master`, in parallel with Vercel's deploy, so migrations must be backwards-compatible. Split destructive changes across two PRs.
- The sign-in page lives at `/ingresar` (`SIGN_IN_PATH` in `lib/auth/routes.ts`). Never run `clerk env pull --instance prod` locally: it overwrites the dev keys in `.env.local`, and live keys don't work on localhost.
- Clerk dev answers curl with a 307 handshake redirect, so verify auth redirects in a browser.
- Landing: full-bleed sections (their own `w-full`, like the "dark box" pattern) must be top-level siblings in `landing-page.tsx`, not nested inside the `max-w-5xl` `CONTAINER_CLASSES` wrapper — nesting silently constrains their width.
- Clerk middleware runs BEFORE rewrites: any reverse-proxy path (e.g. `/_posthog` in next.config) must be in `isPublicRoute` in proxy.ts or anonymous traffic 307s to /ingresar and is silently lost.
- PR previews share the dev `DATABASE_URL` but CI only migrates on push to `dev`/`master` — run `pnpm db:migrate` locally before testing a schema-touching PR preview.
- Route params and FormData ids: never pass raw strings to uuid columns — the `get*ForVehicle` queries guard via `idSchema` (`lib/validation/id.ts`); keep that pattern for new lookups.
- Numeric FormData fields use `isDecimalString` (`lib/validation/numeric.ts`) — `Number()` accepts "0x10"/"Infinity" that Postgres numeric rejects.
- `requireUserId()` redirects to `/ingresar` (expired sessions mid-action should not hit the error boundary).
- Standalone scripts (`scripts/*.ts`) run via Node type-stripping: relative `.ts` imports only, no `@/` alias. `pnpm db:seed [userId] [--fresh]` fills dev DB with all UI states.
- PostHog sourcemaps upload via `withPostHogConfig` (`@posthog/nextjs-config`) in `next.config.ts`, gated on `process.env.VERCEL` so local `pnpm build` never uploads. `@posthog/cli` needs `allowBuilds: true` in `pnpm-workspace.yaml` — its postinstall downloads the binary and pnpm blocks it otherwise. Personal API key lives in Vercel as `POSTHOG_PERSONAL_API_KEY` (secret); project id in `POSTHOG_PROJECT_ID`.
- `vercel env add` quirks: `NEXT_PUBLIC_*` values that look like credentials require explicit `--type config` (real secrets use `--type secret`); adding to multiple environments in one call fails with a `gitBranch` error — run once per target.
