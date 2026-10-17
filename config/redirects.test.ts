import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildRedirects, toHtaccess, type Offer } from "./redirects";

const now = new Date("2026-10-17");
const offer = (slug: string, legacy: string[], extra: Partial<Offer> = {}): Offer => ({
  type: "job",
  slug,
  status: "published",
  legacyPaths: legacy,
  ...extra,
});

describe("Weiterleitungen", () => {
  it("leitet alte Stellen-URLs auf das live Angebot", () => {
    const r = buildRedirects([offer("fbue", ["/stellenanzeige-3/"])], now);
    expect(r).toContainEqual({ from: "/stellenanzeige-3/", to: "/karriere/stellen/fbue/", status: 301 });
  });

  it("leitet auf /karriere/, wenn das Ziel nicht mehr veröffentlicht oder abgelaufen ist", () => {
    const r = buildRedirects(
      [
        offer("a", ["/stellenanzeige-2/"], { status: "draft" }),
        offer("b", ["/stellenanzeige-5/"], { validThrough: "2026-01-01" }),
      ],
      now,
    );
    expect(r).toContainEqual({ from: "/stellenanzeige-2/", to: "/karriere/", status: 301 });
    expect(r).toContainEqual({ from: "/stellenanzeige-5/", to: "/karriere/", status: 301 });
    expect(r).toContainEqual({ from: "/karriere/stellen/b/", to: "/karriere/", status: 301 });
  });

  it("verbietet doppelte Quellen", () => {
    expect(() => buildRedirects([offer("a", ["/x/"]), offer("b", ["/x/"])], now)).toThrow(/doppelt/);
  });

  it("erzeugt Rewrite-Regeln mit optionalem Schlussstrich, 410 für WordPress-Pfade und kanonischem Host", () => {
    const text = toHtaccess(buildRedirects([offer("fbue", ["/stellenanzeige-3/"])], now), {
      canonicalHost: "www.goekbau.de",
    });
    expect(text).toContain("RewriteRule ^stellenanzeige-3/?$ /karriere/stellen/fbue/ [R=301,L]");
    expect(text).toContain("RewriteRule ^sitemap_index\\.xml$ /sitemap.xml [R=301,L]");
    expect(text).toContain("RewriteRule ^wp-login\\.php$ - [G,L]");
    expect(text).toContain("RewriteRule ^wp-admin/ - [G,L]");
    expect(text).toContain("RewriteCond %{HTTP_HOST} ^goekbau\\.de$ [NC]");
    expect(text).toContain("RewriteRule ^ https://www.goekbau.de%{REQUEST_URI} [R=301,L]");
  });

  it("deckt alle fünf alten Stellenanzeigen aus dem echten Inhalt ab", () => {
    const velite = path.resolve(import.meta.dirname, "../.velite");
    const offers = [
      ...JSON.parse(readFileSync(path.join(velite, "jobs.json"), "utf8")),
      ...JSON.parse(readFileSync(path.join(velite, "trainings.json"), "utf8")),
    ] as Offer[];
    const froms = buildRedirects(offers).map((r) => r.from);
    for (let i = 2; i <= 6; i++) expect(froms).toContain(`/stellenanzeige-${i}/`);
  });
});
