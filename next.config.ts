import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "d14jfwlo68bhyr.cloudfront.net",
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Avoid corrupted filesystem webpack cache causing missing CSS/chunks on refresh in dev.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
