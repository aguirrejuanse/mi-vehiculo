import type { NextConfig } from "next";
import { withPostHogConfig } from "@posthog/nextjs-config";

const nextConfig: NextConfig = {
  // The sign-in page moved to a Spanish path; keep old links working.
  async redirects() {
    return [
      { source: "/sign-in", destination: "/ingresar", permanent: true },
      // The event's name carries the ñ — catch people typing/sharing it
      // literally; the canonical route stays ASCII.
      { source: "/transmontaña", destination: "/transmontana", permanent: true },
    ];
  },

  // Proxy PostHog ingestion through our own domain to avoid ad blockers.
  async rewrites() {
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
    return [
      {
        source: "/_posthog/:path*",
        destination: `${host}/:path*`,
      },
    ];
  },
};

// Injects chunkIds into built chunks and uploads the generated
// sourcemaps to PostHog so error-tracking stack traces resolve to real
// file/line. Only runs on Vercel builds — local `pnpm build` skips the
// upload to keep dev symbol sets out of the project.
export default withPostHogConfig(nextConfig, {
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY!,
  projectId: process.env.POSTHOG_PROJECT_ID,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  sourcemaps: {
    enabled: Boolean(process.env.VERCEL),
    deleteAfterUpload: true,
  },
});
