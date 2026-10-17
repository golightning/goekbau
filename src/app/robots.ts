import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { isProductionSite } from "@/lib/site-env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite) {
    // Staging/lokal: komplett gesperrt
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/styleguide/"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
    host: SITE_URL,
  };
}
