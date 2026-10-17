"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CONSENT_EVENT, hasStoredConsent, storeConsent } from "./consent";

/** privacy-consent „Einwilligung merken und widerrufen“: Anzeige des Status und Widerruf (Footer-Link). */
export function ConsentSettings() {
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setGranted(hasStoredConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return (
    <div className="mt-6 rounded-lg border border-bronze-200 bg-bronze-50 p-6">
      <p>
        Diese Website setzt keine Cookies und verwendet kein Tracking. Externe Medien (Google Maps auf der
        Kontaktseite) laden nur nach Ihrer Zustimmung.
      </p>
      <p className="mt-4 font-semibold" role="status">
        {granted === null
          ? "Status wird geladen …"
          : granted
            ? "Externe Medien: dauerhaft erlaubt (lokal in Ihrem Browser gespeichert)."
            : "Externe Medien: nicht dauerhaft erlaubt – Sie werden jedes Mal gefragt."}
      </p>
      {granted && (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => storeConsent(false)}>
            Einwilligung widerrufen
          </Button>
        </div>
      )}
    </div>
  );
}
