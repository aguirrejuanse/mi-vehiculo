/**
 * Canonical site URL, used for absolute links in metadata (OG/Twitter tags,
 * sitemap.ts, robots.ts).
 *
 * On Vercel, falls back to the deployment's own URL so preview/branch
 * deployments advertise their own domain instead of production:
 * - production deploys use VERCEL_PROJECT_PRODUCTION_URL (the assigned
 *   production domain — custom domain if set, else the vercel.app one).
 * - preview/branch deploys use VERCEL_URL (unique per deployment).
 * Only outside Vercel (no env vars set) does it fall back to the hardcoded
 * production domain.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://mivehiculo.vercel.app";
}

export const SITE_URL = resolveSiteUrl();

/**
 * Parsed `SITE_URL`, guarded against a malformed NEXT_PUBLIC_SITE_URL (e.g.
 * missing scheme) — falls back to the hardcoded production domain instead of
 * throwing at module load and taking down every route.
 */
export const SITE_URL_ORIGIN = (() => {
  try {
    return new URL(SITE_URL);
  } catch {
    console.error(
      `Invalid SITE_URL "${SITE_URL}" (check NEXT_PUBLIC_SITE_URL — it needs a scheme, e.g. "https://example.com"). Falling back to the production domain.`,
    );
    return new URL("https://mivehiculo.vercel.app");
  }
})();
