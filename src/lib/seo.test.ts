import { afterEach, describe, expect, it, vi } from "vitest";
import { company } from "@/lib/content";
import { organizationJsonLd } from "./organization";

const seo = {
  title: "Kontakt",
  description:
    "Eine Beschreibung mit genügend Zeichen für die Suchmaschine und die Vorschau in sozialen Netzen.",
  noindex: false,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function load(env?: string) {
  if (env) vi.stubEnv("SITE_ENV", env);
  vi.resetModules();
  return {
    meta: await import("./metadata"),
    sitemap: (await import("@/app/sitemap")).default,
    robots: (await import("@/app/robots")).default,
  };
}

describe("Seiten-Metadaten", () => {
  it("Canonical absolut mit Schrägstrich, de_DE, Standard-OG-Bild", async () => {
    const { meta } = await load("production");
    const m = meta.pageMetadata(seo, "/kontakt/");
    expect(m.title).toEqual({ absolute: "Kontakt | GÖK Bauüberwachung Bahn" });
    expect(m.alternates?.canonical).toBe("https://www.goekbau.de/kontakt/");
    expect(m.openGraph).toMatchObject({ locale: "de_DE", url: "https://www.goekbau.de/kontakt/" });
    expect(JSON.stringify(m.openGraph?.images)).toContain("/brand/og-default.jpg");
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(m.robots).toBeUndefined();
  });

  it("außerhalb der Produktion immer noindex", async () => {
    const { meta } = await load("staging");
    expect(meta.pageMetadata(seo, "/").robots).toEqual({ index: false, follow: false });
  });
});

describe("robots.txt und Sitemap", () => {
  it("Staging sperrt alles", async () => {
    const { robots } = await load("staging");
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("Produktion verweist auf die Sitemap", async () => {
    const { robots } = await load("production");
    expect(robots().sitemap).toBe("https://www.goekbau.de/sitemap.xml");
  });

  it("Sitemap enthält Seiten und veröffentlichte Angebote, aber keinen Styleguide", async () => {
    const { sitemap } = await load("production");
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://www.goekbau.de/");
    expect(urls).toContain("https://www.goekbau.de/karriere/stellen/fachbauueberwacher-oberbau/");
    expect(urls).toContain("https://www.goekbau.de/impressum/");
    expect(urls.some((u) => u.includes("styleguide"))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("Organisation (JSON-LD)", () => {
  it("nutzt die Stammdaten und enthält keine E-Mail-Adresse", () => {
    const ld = organizationJsonLd(company);
    // Keine Telefonnummer auf der Website, auch nicht maschinenlesbar (Spam-Anrufe)
    expect(ld).not.toHaveProperty("telephone");
    expect(JSON.stringify(ld)).not.toContain(company.phone.e164);
    expect(ld.address.streetAddress).toBe(company.address.street);
    expect(ld.contactPoint.url).toBe("https://www.goekbau.de/kontakt/");
    expect(JSON.stringify(ld)).not.toMatch(/@goekbau\.de/);
  });
});
