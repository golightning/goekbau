import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "GÖK Bauüberwachung Bahn",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
