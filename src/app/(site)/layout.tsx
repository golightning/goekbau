import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";

/** Alle Live-Seiten: Header, Footer und Schnellkontakt. Die URLs ändern sich durch die Route-Group nicht. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
