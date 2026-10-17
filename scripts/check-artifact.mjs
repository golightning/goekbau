// Prüft das Deploy-Artefakt, bevor es ausgeliefert wird:
// - email-security „Schutz vor Adress-Harvesting“: keine E-Mail-Adresse der Domain im HTML/RSC-Payload
// - web-security: keine Source-Maps, keine PHP-Dateien außerhalb von api/ und _app/
// Aufruf: node scripts/check-artifact.mjs <Artefakt-Verzeichnis>
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "dist/site");
const EMAIL = /[\w.+-]+@goekbau\.de/i;
const problems = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    const rel = path.relative(root, p);
    if (entry.isDirectory()) {
      if (rel === "_app") continue;
      await walk(p);
      continue;
    }
    if (/\.(html|txt|js|json|xml)$/.test(entry.name)) {
      const text = await readFile(p, "utf8");
      const m = text.match(EMAIL);
      if (m) problems.push(`${rel}: E-Mail-Adresse im Klartext (${m[0]})`);
    }
    if (entry.name.endsWith(".map")) problems.push(`${rel}: Source-Map im Artefakt`);
    if (entry.name.endsWith(".php") && !rel.startsWith("api" + path.sep))
      problems.push(`${rel}: PHP außerhalb von api/`);
  }
}

await walk(root);
if (problems.length) {
  console.error(`Artefakt-Prüfung fehlgeschlagen:\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log("Artefakt-Prüfung: keine E-Mail-Adressen, Source-Maps oder verirrten PHP-Dateien");
