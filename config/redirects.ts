// legacy-url-redirects: versionierte Liste aller Weiterleitungen der bisherigen WordPress-Site.
// Stellen-/Ausbildungs-URLs werden aus `legacyPaths` im Inhaltsmodell abgeleitet, damit Liste und Inhalte
// nie auseinanderlaufen. Erzeugt den Rewrite-Block der .htaccess (scripts/write-htaccess.ts).

export type Redirect = { from: string; to: string; status: 301 } | { from: string; status: 410 };

export type Offer = {
  type: "job" | "training";
  slug: string;
  status: "draft" | "published";
  validThrough?: string;
  legacyPaths?: string[];
};

export const CAREERS = "/karriere/";

/** Statische Weiterleitungen (unabhängig vom Inhalt) */
export const STATIC_REDIRECTS: Redirect[] = [
  { from: "/home/", to: "/", status: 301 },
  { from: "/sitemap_index.xml", to: "/sitemap.xml", status: 301 },
  { from: "/page-sitemap.xml", to: "/sitemap.xml", status: 301 },
  { from: "/wp-sitemap.xml", to: "/sitemap.xml", status: 301 },
  { from: "/feed/", to: "/", status: 301 },
  { from: "/comments/feed/", to: "/", status: 301 },
];

/** WordPress-Pfade, die es nicht mehr gibt – 410 statt 404, ohne PHP-Ausführung */
export const GONE_PREFIXES = [
  "/wp-admin/",
  "/wp-login.php",
  "/wp-json/",
  "/xmlrpc.php",
  "/wp-content/",
  "/wp-includes/",
  "/wp-cron.php",
];

export function isLive(offer: Offer, now: Date): boolean {
  return offer.status === "published" && !(offer.validThrough && new Date(offer.validThrough) < now);
}

export function offerPath(offer: Offer): string {
  return offer.type === "job" ? `/karriere/stellen/${offer.slug}/` : `/karriere/ausbildung/${offer.slug}/`;
}

/** Alle Weiterleitungen: alte Angebots-URLs → Angebot (oder /karriere/, wenn nicht mehr live) + statische. */
export function buildRedirects(offers: Offer[], now: Date = new Date()): Redirect[] {
  const fromOffers: Redirect[] = offers.flatMap((offer) =>
    (offer.legacyPaths ?? []).map((from) => ({
      from,
      to: isLive(offer, now) ? offerPath(offer) : CAREERS,
      status: 301 as const,
    })),
  );
  // Abgelaufene/entfernte Angebote ohne legacyPaths leiten ebenfalls auf die Übersicht
  const retired: Redirect[] = offers
    .filter((o) => !isLive(o, now))
    .map((o) => ({ from: offerPath(o), to: CAREERS, status: 301 as const }));
  const all = [...fromOffers, ...retired, ...STATIC_REDIRECTS];
  const seen = new Set<string>();
  for (const r of all) {
    if (seen.has(r.from)) throw new Error(`Weiterleitung doppelt definiert: ${r.from}`);
    seen.add(r.from);
  }
  return all;
}

const escape = (p: string) => p.replace(/^\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Apache-Rewrite-Regeln (mod_rewrite, Pfade ohne führenden Schrägstrich, optionaler Schlussstrich). */
export function toHtaccess(redirects: Redirect[], options: { canonicalHost?: string } = {}): string {
  const lines: string[] = [
    "# --- generiert von scripts/write-htaccess.ts aus config/redirects.ts – nicht von Hand ändern ---",
  ];
  if (options.canonicalHost) {
    const target = `https://${options.canonicalHost}%{REQUEST_URI}`;
    const apex = options.canonicalHost.replace(/^www\./, "").replace(/\./g, "\\.");
    lines.push(
      "# Kanonischer Host und HTTPS – jeweils genau ein Sprung (legacy-url-redirects)",
      `RewriteCond %{HTTP_HOST} ^${apex}$ [NC]`,
      `RewriteRule ^ ${target} [R=301,L]`,
      "# HTTP → HTTPS; hinter einem TLS-terminierenden Proxy zählt X-Forwarded-Proto (keine Schleife)",
      "RewriteCond %{HTTPS} off",
      "RewriteCond %{HTTP:X-Forwarded-Proto} !=https",
      `RewriteRule ^ ${target} [R=301,L]`,
    );
  }
  for (const prefix of GONE_PREFIXES) {
    lines.push(`RewriteRule ^${escape(prefix)}${prefix.endsWith("/") ? "" : "$"} - [G,L]`);
  }
  for (const r of redirects) {
    if (r.status === 410) {
      lines.push(`RewriteRule ^${escape(r.from)}$ - [G,L]`);
      continue;
    }
    const pattern = r.from.endsWith("/") ? `${escape(r.from).replace(/\/$/, "")}/?` : escape(r.from);
    lines.push(`RewriteRule ^${pattern}$ ${r.to} [R=301,L]`);
  }
  lines.push("# --- Ende generiert ---");
  return lines.join("\n");
}
