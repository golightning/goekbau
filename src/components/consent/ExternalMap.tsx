"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CONSENT_EVENT, hasStoredConsent, storeConsent } from "./consent";

type Props = { query: string; label: string; addressLines: string[] };

/**
 * privacy-consent „Karte nur nach Zustimmung“: statischer Platzhalter ohne Requests an Google.
 * Erst „Karte laden“ bettet Google Maps ein; „Entscheidung merken“ speichert das lokal.
 */
export function ExternalMap({ query, label, addressLines }: Props) {
  const [load, setLoad] = useState(false);
  const [remember, setRemember] = useState(false);
  const rememberId = useId();
  const encoded = encodeURIComponent(query);

  useEffect(() => {
    const sync = () => setLoad((current) => current || hasStoredConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (load) {
    return (
      <div className="overflow-hidden rounded-lg border border-bronze-200">
        <iframe
          title={`Karte: ${label}`}
          src={`https://maps.google.com/maps?q=${encoded}&t=m&z=15&output=embed&hl=de`}
          className="block h-[26rem] w-full"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 rounded-lg border-2 border-dashed border-bronze-300 bg-white p-6 md:grid-cols-[auto_1fr] md:p-8">
      <svg aria-hidden="true" viewBox="0 0 64 64" className="size-16 fill-bronze-500">
        <path d="M32 4C20.4 4 11 13.4 11 25c0 15.8 21 35 21 35s21-19.2 21-35C53 13.4 43.6 4 32 4Zm0 29a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
      </svg>
      <div>
        <p className="font-heading text-lg font-bold">{label}</p>
        <p className="mt-1 text-slate">{addressLines.join(", ")}</p>
        <p className="mt-4 max-w-prose text-sm">
          Zum Schutz Ihrer Daten laden wir die Karte von Google Maps erst nach Ihrer Zustimmung. Dabei werden
          Daten (u. a. Ihre IP-Adresse) an Google übertragen – mehr dazu in der{" "}
          <a href="/datenschutz/" className="font-semibold text-bronze-800 underline">
            Datenschutzerklärung
          </a>
          .
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Button
            onClick={() => {
              if (remember) storeConsent(true);
              setLoad(true);
            }}
          >
            Karte laden
          </Button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-accent text-sm font-semibold text-bronze-800 underline underline-offset-4"
          >
            In Google Maps öffnen<span className="sr-only"> (öffnet in neuem Fenster)</span>
          </a>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <input
            id={rememberId}
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.currentTarget.checked)}
            className="size-4 accent-bronze-700"
          />
          <label htmlFor={rememberId}>Entscheidung merken (Karten künftig immer laden)</label>
        </div>
      </div>
    </div>
  );
}
