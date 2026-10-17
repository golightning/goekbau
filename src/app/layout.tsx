import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QuickContact } from "@/components/layout/QuickContact";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { fontVariables } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "GÖK Bauüberwachung Bahn",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        {/* site-navigation „Sprunglink“: erstes fokussierbares Element */}
        <a
          href="#inhalt"
          className="sr-only z-50 rounded-md bg-ink px-4 py-3 font-accent text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <QuickContact />
      </body>
    </html>
  );
}
