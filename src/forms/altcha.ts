// Selbst gehosteter ALTCHA-Löser (Proof-of-Work, v1-Verfahren): findet n mit SHA-256(salt + n) == challenge.
// Kein Widget, kein Web Worker, keine Drittanbieter (spam-protection).

export type AltchaChallenge = {
  algorithm: string;
  challenge: string;
  maxnumber: number;
  salt: string;
  signature: string;
};

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Löst die Challenge in Häppchen, damit die Seite bedienbar bleibt. Liefert den Base64-Payload. */
export async function solveAltcha(c: AltchaChallenge, signal?: AbortSignal): Promise<string> {
  if (c.algorithm !== "SHA-256") throw new Error("Unbekannter Algorithmus");
  const encoder = new TextEncoder();
  for (let n = 0; n <= c.maxnumber; n++) {
    if (signal?.aborted) throw new DOMException("abgebrochen", "AbortError");
    const hash = toHex(await crypto.subtle.digest("SHA-256", encoder.encode(c.salt + n)));
    if (hash === c.challenge) {
      const payload = {
        algorithm: c.algorithm,
        challenge: c.challenge,
        number: n,
        salt: c.salt,
        signature: c.signature,
      };
      return btoa(JSON.stringify(payload));
    }
    if (n % 2000 === 1999) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error("Keine Lösung gefunden");
}
