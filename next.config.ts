import type { NextConfig } from "next";

const BACKEND = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://negarit-backend.onrender.com/api/v1").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/negarit-api/:path*",
        destination: `${BACKEND}/:path*`,
      },
    ];
  },
};

export default nextConfig;
