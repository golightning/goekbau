// Fügt die generierten Weiterleitungen in die .htaccess des Artefakts ein (Task 10.4).
// Aufruf: node scripts/write-htaccess.ts <Artefakt-Verzeichnis>   (SITE_ENV=production → kanonischer Host)
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildRedirects, toHtaccess, type Offer } from "../config/redirects.ts";

const root = path.resolve(process.argv[2] ?? "dist/site");
const velite = path.resolve(import.meta.dirname, "../.velite");
const offers: Offer[] = [
  ...JSON.parse(readFileSync(path.join(velite, "jobs.json"), "utf8")),
  ...JSON.parse(readFileSync(path.join(velite, "trainings.json"), "utf8")),
];

const production = process.env.SITE_ENV === "production";
const block = toHtaccess(buildRedirects(offers), production ? { canonicalHost: "www.goekbau.de" } : {});
const file = path.join(root, ".htaccess");
const htaccess = readFileSync(file, "utf8");
if (!htaccess.includes("# ##REDIRECTS##")) throw new Error(".htaccess ohne Platzhalter # ##REDIRECTS##");
writeFileSync(
  file,
  htaccess.replace(
    /^.*# ##REDIRECTS##.*$/m,
    block
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n"),
  ),
);
console.log(`Weiterleitungen eingefügt (${production ? "mit" : "ohne"} kanonischem Host)`);
