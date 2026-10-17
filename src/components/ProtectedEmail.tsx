import { ProtectedEmailClient } from "./ProtectedEmailClient";

/** Kodierung nur auf dem Server: im HTML und in der RSC-Payload steht kein „@“ der Adresse. */
export function encodeEmail(address: string): string {
  return Buffer.from([...address].reverse().join(""), "utf8").toString("base64");
}

export function fallbackEmail(address: string): string {
  return address.replace("@", " [at] ");
}

/**
 * email-security „Schutz vor Adress-Harvesting“: lesbarer Fallback ohne JS, echter mailto-Link nach
 * dem Hydrieren.
 */
export function ProtectedEmail({ address, className }: { address: string; className?: string }) {
  return (
    <ProtectedEmailClient
      encoded={encodeEmail(address)}
      fallback={fallbackEmail(address)}
      className={className}
    />
  );
}
