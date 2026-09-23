import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sign-in page moved to a Spanish path; keep old links working.
  async redirects() {
    return [{ source: "/sign-in", destination: "/ingresar", permanent: true }];
  },
};

export default nextConfig;
