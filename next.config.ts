import type { NextConfig } from "next";

// Statischer Export für IONOS Deploy Now (design.md D1): kein Node-Server zur Laufzeit.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
