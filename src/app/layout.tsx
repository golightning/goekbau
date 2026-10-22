import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL, TITLE_SUFFIX } from "@/lib/metadata";
import { isProductionSite } from "@/lib/site-env";
import { fontVariables } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE_SUFFIX, template: `%s | ${TITLE_SUFFIX}` },
  // seo-metadata „Staging nicht indexierbar“
  ...(isProductionSite ? {} : { robots: { index: false, follow: false } }),
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
        {/* Header, Footer und Schnellkontakt: app/(site)/layout.tsx bzw. not-found.tsx (SiteChrome) */}
        {children}
      </body>
    </html>
  );
}
