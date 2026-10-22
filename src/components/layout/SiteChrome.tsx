import type { ReactNode } from "react";
import { QuickContact } from "./QuickContact";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Header, Footer und Schnellkontakt der Live-Seite. Genutzt vom Layout der Route-Group `(site)` und von der
 * Fehlerseite (die der statische Export aus `app/not-found.tsx` unter dem Root-Layout erzeugt). Entwürfe unter
 * `/entwurf/` liegen außerhalb von `(site)` und bringen eigene mit (redesign-home-page, D3).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <QuickContact />
    </>
  );
}
