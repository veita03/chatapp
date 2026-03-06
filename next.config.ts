import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/signin/:provider*',
        destination: `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/auth/signin/:provider*`,
      },
      {
        source: '/api/auth/callback/:provider*',
        destination: `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/auth/callback/:provider*`,
      },
    ];
  },
};

export default nextConfig;
