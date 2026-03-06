import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
    const siteUrl = convexUrl.replace(".cloud", ".site");
    return [
      {
        source: '/api/auth/signin/:provider*',
        destination: `${siteUrl}/api/auth/signin/:provider*`,
      },
      {
        source: '/api/auth/callback/:provider*',
        destination: `${siteUrl}/api/auth/callback/:provider*`,
      },
    ];
  },
};

export default nextConfig;
