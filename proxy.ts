import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { HERO_VARIANTS } from "@/lib/landing/hero-variants";

// Public routes: the landing page (and its per-vehicle variants) and the guest
// vehicle wizard. Everything else under the app (dashboard, etc.) requires
// authentication.
const isPublicRoute = createRouteMatcher([
  "/",
  "/nuevo",
  ...HERO_VARIANTS.map((variant) => `/${variant.slug}`),
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
