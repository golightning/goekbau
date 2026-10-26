import { describe, expect, it } from "vitest";
import { projectsSorted } from "@/lib/content";
import { BORDER_X, fromHub, HUB, ROUTES } from "./network";

describe("Streckennetz der Startseite", () => {
  it("zeichnet nur Strecken, die es als Projekt gibt", () => {
    const slugs = new Set(projectsSorted().map((p) => p.slug));
    for (const r of ROUTES) expect(slugs, r.slug).toContain(r.slug);
  });

  it("legt jede Strecke auf die Seite der Landesgrenze, die ihr Projekt nennt", () => {
    const region = new Map(projectsSorted().map((p) => [p.slug, p.region]));
    for (const r of ROUTES) {
      const east = r.stations.every((s) => s.x > BORDER_X);
      expect(region.get(r.slug), r.slug).toBe(east ? "Bayern" : "Baden-Württemberg");
    }
  });

  it("beginnt die Messfahrt am sitznahen Ende", () => {
    for (const r of ROUTES) {
      const [first, ...rest] = fromHub(r);
      const d = (p: { x: number; y: number }) => Math.hypot(p.x - HUB.x, p.y - HUB.y);
      expect(d(first!)).toBeLessThanOrEqual(d(rest[rest.length - 1]!));
    }
  });
});
