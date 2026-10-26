import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DraftCanary } from "@/drafts/DraftCanary";

// Entwürfe der Startseite (redesign-home-page). Nur im Dev und im Prüfbuild eine Seite (Dateiendung .draft.tsx).
// Liegt außerhalb der Route-Group (site): kein Live-Header und -Footer, jeder Entwurf bringt eigene mit (D3).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DraftLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DraftCanary />
      {children}
    </>
  );
}
