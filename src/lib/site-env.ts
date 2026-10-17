/**
 * Build-Umgebung: nur `SITE_ENV=production` erzeugt eine indexierbare Website.
 * Alles andere (lokal, CI, Staging) ist per Meta-Robots, X-Robots-Tag und robots.txt gesperrt (seo-metadata).
 */
export const isProductionSite = process.env.SITE_ENV === "production";
