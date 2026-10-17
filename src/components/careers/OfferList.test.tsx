import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Offer } from "@/lib/content";
import { isLive, offerPath } from "@/lib/content";
import { OfferList } from "./OfferList";

const base = {
  status: "published" as const,
  summary: "Kurzbeschreibung des Angebots mit genug Zeichen.",
  datePosted: "2026-10-01",
  location: { city: "Senden", region: "Bayern" },
  legacyPaths: [],
  seo: { title: "x", description: "y", noindex: false },
  body: "<p>Text</p>",
};
const job = (slug: string, extra: Partial<Offer> = {}) =>
  ({ ...base, type: "job", slug, title: `Stelle ${slug}`, employmentType: ["FULL_TIME"], ...extra }) as Offer;
const training = (slug: string) =>
  ({ ...base, type: "training", slug, title: `Ausbildung ${slug}` }) as Offer;

describe("OfferList", () => {
  it("listet Angebote mit Titel, Kurzbeschreibung und Link zur Detailseite", () => {
    const html = renderToStaticMarkup(<OfferList offers={[job("a"), job("b")]} emptyText="leer" />);
    expect(html.match(/<li/g)).toHaveLength(2);
    // next/link kennt außerhalb von Next die trailingSlash-Option nicht; im Build geprüft per E2E
    expect(html).toMatch(/href="\/karriere\/stellen\/a\/?"/);
    expect(html).toContain("Kurzbeschreibung des Angebots");
  });

  it("zeigt bei 0 Stellen den Hinweis statt einer leeren Liste", () => {
    const html = renderToStaticMarkup(<OfferList offers={[]} emptyText="Initiativbewerbung willkommen" />);
    expect(html).toContain("Initiativbewerbung willkommen");
    expect(html).not.toContain("<ul");
  });
});

describe("Veröffentlichungsstatus", () => {
  const now = new Date("2026-10-17");
  it("zeigt nur veröffentlichte, nicht abgelaufene Angebote", () => {
    expect(isLive(job("a"), now)).toBe(true);
    expect(isLive(job("b", { status: "draft" }), now)).toBe(false);
    expect(isLive(job("c", { validThrough: "2026-10-01" }), now)).toBe(false);
    expect(isLive(job("d", { validThrough: "2026-12-31" }), now)).toBe(true);
  });

  it("trennt URLs nach Typ", () => {
    expect(offerPath(job("x"))).toBe("/karriere/stellen/x/");
    expect(offerPath(training("y"))).toBe("/karriere/ausbildung/y/");
  });
});
