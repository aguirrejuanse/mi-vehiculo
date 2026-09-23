import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sign-in page moved to a Spanish path; keep old links working.
  async redirects() {
    return [{ source: "/sign-in", destination: "/ingresar", permanent: true }];
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

export default nextConfig;
