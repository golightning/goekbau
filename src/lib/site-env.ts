/**
 * Build-Umgebung: nur `SITE_ENV=production` erzeugt eine indexierbare Website.
 * Alles andere (lokal, CI, Staging) ist per Meta-Robots, X-Robots-Tag und robots.txt gesperrt (seo-metadata).
 */
export const isProductionSite = process.env.SITE_ENV === "production";

/**
 * Unterpfad der Auslieferung, nur für die Demo auf GitHub Pages (`/goekbau`); in Produktion leer.
 * next/link und die _next-Dateien bekommen ihn über `basePath`, feste Pfade auf public/ über withBase().
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const withBase = (path: string) => `${BASE_PATH}${path}`;
