// privacy-consent „Einwilligung merken und widerrufen“: gespeichert wird nur bei „Immer laden“ –
// ausschließlich lokal im Browser, kein Cookie.
export const CONSENT_KEY = "goek.consent.externalMedia";
export const CONSENT_EVENT = "goek:consent-change";

export function hasStoredConsent(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function storeConsent(granted: boolean): void {
  try {
    if (granted) window.localStorage.setItem(CONSENT_KEY, "granted");
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Speicher nicht verfügbar (privater Modus) – Einwilligung gilt dann nur für diesen Seitenaufruf
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
