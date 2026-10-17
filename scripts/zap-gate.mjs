// DAST-Gate (web-security „Dynamischer Sicherheitstest“): bricht ab, sobald der ZAP-Bericht einen Fund mit
// Risiko „Medium“ oder höher enthält, der nicht in .zap/rules.tsv begründet ist.
import { readFileSync } from "node:fs";

const report = JSON.parse(readFileSync(process.argv[2] ?? ".zap/report.json", "utf8"));
const documented = new Set(
  readFileSync(".zap/rules.tsv", "utf8")
    .split("\n")
    .filter((l) => /^\d+\t/.test(l))
    .map((l) => l.split("\t")[0]),
);
// Gezielte Ausnahmen je Regel und URL (z. B. Zufallswerte, die wie Kartennummern aussehen)
const exceptions = readFileSync(".zap/exceptions.tsv", "utf8")
  .split("\n")
  .filter((l) => /^\d+\t/.test(l))
  .map((l) => {
    const [id, pattern] = l.split("\t");
    return { id, re: new RegExp(pattern) };
  });
const excepted = (a, uri) => exceptions.some((e) => e.id === String(a.pluginid) && e.re.test(uri));
const alerts = report.site.flatMap((s) => s.alerts ?? []);
const blocking = alerts.filter(
  (a) =>
    Number(a.riskcode) >= 2 &&
    !documented.has(String(a.pluginid)) &&
    (a.instances ?? [{ uri: "" }]).some((i) => !excepted(a, i.uri)),
);
for (const a of alerts)
  console.log(`${["Info", "Niedrig", "Mittel", "Hoch"][Number(a.riskcode)]}\t${a.pluginid}\t${a.alert}`);
if (blocking.length) {
  console.error(
    `\nDAST-Gate: ${blocking.length} Fund(e) ab Risiko „Mittel“ ohne Begründung – Deployment blockiert.`,
  );
  process.exit(1);
}
console.log(`\nDAST-Gate bestanden: ${alerts.length} Hinweise, keiner ab Risiko „Mittel“ offen.`);
