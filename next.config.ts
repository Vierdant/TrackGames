import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      }
    ],
  },
};

export default nextConfig;
