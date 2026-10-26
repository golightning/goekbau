import type { ReactNode } from "react";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { QuickContact } from "@/components/layout/QuickContact";
import "@/components/home/home.css";

/**
 * Startseite mit eigenem dunklen Header und Footer (redesign-home-page, Richtung D „Netzplan“). Alle übrigen
 * Seiten behalten SiteChrome aus app/(site)/layout.tsx.
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="hp-dark flex flex-1 flex-col bg-ink text-white">
      <HomeHeader />
      <div className="flex-1">{children}</div>
      <HomeFooter />
      <QuickContact />
    </div>
  );
}
