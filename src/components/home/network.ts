/**
 * Schematische Lage der Projektabschnitte im Streckennetz der Startseite (viewBox 1000 × 560).
 * Nur grob relativ (Himmelsrichtung, Reihenfolge der Orte), nicht geografisch – das Bild sagt das auch.
 * Schlüssel ist der Slug in content/projects/; ein Projekt ohne Eintrag erscheint nur in der Liste,
 * nicht im Netz (src/components/home/network.test.ts prüft, dass jeder Eintrag ein Projekt hat).
 */
export type Station = {
  name: string;
  x: number;
  y: number;
  anchor?: "start" | "end" | "middle";
  dy?: number;
};
export type RouteGeometry = {
  slug: string;
  label: string;
  stations: Station[];
  /** Lage des Streckennummer-Schilds, bei schmaler Darstellung optional versetzt */
  tag: [number, number];
  tagCompact?: [number, number];
};

/** Firmensitz (Senden) */
export const HUB = { x: 470, y: 330 };

/** Grenze Baden-Württemberg | Bayern */
export const BORDER_X = 440;

export const ROUTES: RouteGeometry[] = [
  {
    slug: "strecke-4930",
    label: "4930",
    tag: [140, 70],
    stations: [
      { name: "Schwäbisch Hall", x: 320, y: 70, anchor: "start" },
      { name: "Gaildorf", x: 270, y: 120, anchor: "end" },
      { name: "Fornsbach", x: 220, y: 170, anchor: "end" },
    ],
  },
  {
    slug: "strecke-4940",
    label: "4940",
    tag: [300, 193],
    tagCompact: [200, 285],
    stations: [
      { name: "Ellwangen", x: 390, y: 150, anchor: "end" },
      { name: "Goldshöfe", x: 390, y: 220, anchor: "end" },
    ],
  },
  {
    slug: "strecke-4540",
    label: "4540",
    tag: [240, 522],
    stations: [
      { name: "Rechtenstein", x: 340, y: 410, anchor: "end", dy: -12 },
      { name: "Riedlingen", x: 280, y: 450, anchor: "start" },
      { name: "Herbertingen", x: 220, y: 490, anchor: "end" },
    ],
  },
  {
    slug: "strecke-5830",
    label: "5830",
    tag: [790, 300],
    stations: [
      { name: "Obertraubling", x: 730, y: 190, anchor: "middle", dy: -18 },
      { name: "Passau", x: 900, y: 250, anchor: "middle", dy: -18 },
    ],
  },
];

type Pt = { x: number; y: number };

/** Stationen so geordnet, dass der Abschnitt am sitznahen Ende beginnt (für Anfahrt und Messfahrt). */
export function fromHub(r: RouteGeometry): Pt[] {
  const s = r.stations;
  const d = (p: Pt) => Math.hypot(p.x - HUB.x, p.y - HUB.y);
  return d(s[0]!) <= d(s[s.length - 1]!) ? s : [...s].reverse();
}

export const polyline = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
