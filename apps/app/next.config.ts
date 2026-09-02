import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "localhost:3002",
    "127.0.0.1:3002",
  ],
};

export default nextConfig;
