import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// Lokaler Prod-Nachbau (docker compose) – liefert im Dev-Modus die PHP-Endpoints unter /api/
const PHP_ORIGIN = process.env.LOCAL_PHP_ORIGIN ?? "http://localhost:8080";

// Statischer Export für IONOS Deploy Now (design.md D1): kein Node-Server zur Laufzeit.
// Nur im Dev-Server (`pnpm dev`) wird /api/* an den Docker-Nachbau weitergereicht, damit Formulare funktionieren.
const nextConfig: NextConfig = {
  ...(isDev
    ? {
        async rewrites() {
          return [{ source: "/api/:path*", destination: `${PHP_ORIGIN}/api/:path*` }];
        },
      }
    : { output: "export" as const }),
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
