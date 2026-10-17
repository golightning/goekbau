// web-security „Strikte Content Security Policy“ (design.md D11): Der statische Next-Export enthält Inline-Skripte
// (RSC-Payload). Ohne Server gibt es keine Nonces – deshalb berechnet dieses Skript je HTML-Datei die SHA-256-Hashes
// aller ausführbaren Inline-Skripte und setzt eine Meta-CSP direkt an den Anfang von <head>.
// Aufruf: node scripts/csp-hash.mjs <Artefakt-Verzeichnis>
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "dist/site");

// Nur hier freigegebene Fremd-Origins; Google Maps lädt erst nach Einwilligung (privacy-consent)
export const FRAME_SRC = ["https://www.google.com", "https://maps.google.com"];

/** Inline-Skripte, die der Browser ausführt: kein src, kein Daten-Typ (JSON-LD etc. ist nicht ausführbar). */
export function inlineScripts(html) {
  const out = [];
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1] ?? "";
    if (/\ssrc\s*=/i.test(attrs)) continue;
    const type = attrs.match(/\stype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    if (type && !["text/javascript", "module", "application/javascript"].includes(type)) continue;
    out.push(m[2]);
  }
  return out;
}

export function policyFor(html) {
  const hashes = [
    ...new Set(
      inlineScripts(html).map((s) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`),
    ),
  ];
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`.trim(),
    // React/Radix setzen style-Attribute; Inline-Styles sind kein Skript-Einfallstor
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    `frame-src ${FRAME_SRC.join(" ")}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function applyCsp(html) {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policyFor(html)}">`;
  const withoutOld = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i, "");
  if (!/<head[^>]*>/i.test(withoutOld)) throw new Error("kein <head> gefunden");
  return withoutOld.replace(/<head([^>]*)>/i, `<head$1>${meta}`);
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_app") continue;
      yield* htmlFiles(p);
    } else if (entry.name.endsWith(".html")) yield p;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let count = 0;
  for await (const file of htmlFiles(root)) {
    await writeFile(file, applyCsp(await readFile(file, "utf8")));
    count++;
  }
  console.log(`CSP gesetzt in ${count} HTML-Dateien`);
}
