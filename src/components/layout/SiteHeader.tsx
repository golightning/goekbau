"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Layout";
import { cx } from "@/components/ui/cx";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";

/**
 * Schlichte weiße Leiste ohne Linie und Unschärfe. Auf der Startseite liegt die Kopfzeile transparent über dem
 * dunklen Hero; das Logo-Abzeichen sitzt dort in der Ecke des Fotos (site-navigation: Logo auf jeder Seite).
 */
export function SiteHeader() {
  const home = usePathname() === "/";
  return (
    <header className={cx("z-30", home ? "absolute inset-x-0 top-0" : "sticky top-0 bg-white")}>
      {home ? (
        // gleiche Ränder wie der Hero: Logo in der Fotoecke, Navigation bündig mit dem Namen
        <div className="flex items-center justify-between gap-4 px-6 py-6 lg:px-8 lg:py-8">
          <Logo />
          <MainNav tone="dark" />
        </div>
      ) : (
        <Container className="flex items-center justify-between gap-4 py-2">
          <Logo priority />
          <MainNav />
        </Container>
      )}
    </header>
  );
}
