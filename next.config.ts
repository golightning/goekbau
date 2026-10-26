import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// Prüfbuild der Startseiten-Entwürfe (redesign-home-page D4): nur auf ausdrückliche Anforderung, eigene Ausgabe.
const isDraftBuild = process.env.GOEKBAU_DRAFT_BUILD === "1";
// Entwurfsseiten heißen *.draft.tsx und sind nur im Dev und im Prüfbuild Seiten (D2); das auslieferbare
// Artefakt kennt sie nicht. Nachweis: scripts/check-artifact.mjs (Kanarienvogel mit Positivkontrolle).
const pageExtensions =
  isDev || isDraftBuild ? ["draft.tsx", "tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js"];
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
  ...(isDraftBuild ? { distDir: "out-drafts" } : {}),
  pageExtensions,
  // Nur Demo auf GitHub Pages (Unterpfad /goekbau); Produktion ohne
  ...(process.env.NEXT_PUBLIC_BASE_PATH ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH } : {}),
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
