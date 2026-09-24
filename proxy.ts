import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { SIGN_IN_PATH } from "@/lib/auth/routes";
import { HERO_VARIANTS } from "@/lib/landing/hero-variants";
// Imported for its side effect: validates Clerk env vars eagerly so a
// misconfigured prod deploy fails fast here instead of surfacing an opaque
// Clerk SDK error later.
import "@/lib/env";

// Public routes: the landing page (and its per-vehicle variants), the guest
// vehicle wizard, our own embedded sign-in page, and the file-based metadata
// routes crawlers/social bots hit (sitemap, robots, OG image, icons — most
// have no extension, or one not covered by the matcher's static-asset
// exclusion below, so without this they'd 307 to sign-in for every crawler
// request). Everything else under the app (dashboard, etc.) requires
// authentication.
const isPublicRoute = createRouteMatcher([
  "/",
  "/nuevo",
  SIGN_IN_PATH,
  "/sitemap.xml",
  "/robots.txt",
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  // PostHog reverse proxy: middleware runs before rewrites, so without this
  // every event from signed-out visitors 307s to sign-in and is lost.
  "/_posthog(.*)",
  ...HERO_VARIANTS.map((variant) => `/${variant.slug}`),
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  },
  // Without this, protect() sends signed-out visitors to Clerk's hosted
  // Account Portal instead of our embedded sign-in page.
  { signInUrl: SIGN_IN_PATH },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static assets, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
