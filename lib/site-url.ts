/**
 * Canonical site URL, used for absolute links in metadata (OG/Twitter tags,
 * sitemap.ts, robots.ts). Defaults to the Vercel preview domain until a
 * custom domain is configured via NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mivehiculo.vercel.app";
