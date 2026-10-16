// content-model „Unternehmensstammdaten als einzige Quelle“: Telefon, E-Mail und Anschrift dürfen im
// Code nicht als Literal stehen – nur in content/company.yaml.

const PHONE = /(?:\+49|\b0)\s?\(?\d{2,5}\)?[\s/-]?\d{3,}[\s-]?\d{2,}/;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/i;

export type Finding = { line: number; kind: "Telefon" | "E-Mail" | "Stammdatum"; text: string };

/** Prüft Quelltext auf Stammdaten-Literale. `knownValues` sind konkrete Werte aus company.yaml. */
export function findMasterDataLiterals(source: string, knownValues: string[] = []): Finding[] {
  const findings: Finding[] = [];
  source.split("\n").forEach((text, i) => {
    const line = i + 1;
    if (PHONE.test(text)) findings.push({ line, kind: "Telefon", text: text.trim() });
    if (EMAIL.test(text)) findings.push({ line, kind: "E-Mail", text: text.trim() });
    for (const value of knownValues) {
      if (value.length >= 6 && text.includes(value))
        findings.push({ line, kind: "Stammdatum", text: text.trim() });
    }
  });
  return findings;
}
