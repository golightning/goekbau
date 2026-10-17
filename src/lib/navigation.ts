export type NavItem = { href: string; label: string };

/** site-navigation „Hauptnavigation“ */
export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/uber-uns/", label: "Über uns" },
  { href: "/leistungen/", label: "Leistungen" },
  { href: "/karriere/", label: "Karriere" },
  { href: "/kontakt/", label: "Kontakt" },
];

export const legalNav: NavItem[] = [
  { href: "/impressum/", label: "Impressum" },
  { href: "/datenschutz/", label: "Datenschutz" },
  { href: "/barrierefreiheit/", label: "Barrierefreiheit" },
];

/** Aktiver Bereich: exakte Startseite, sonst Präfix (z. B. /karriere/stellen/… → Karriere). */
export function isActive(href: string, pathname: string): boolean {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return href === "/" ? path === "/" : path.startsWith(href);
}
