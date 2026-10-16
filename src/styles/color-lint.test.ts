import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const eslint = new ESLint({ cwd: root });

async function lint(code: string) {
  const [result] = await eslint.lintText(code, { filePath: path.join(root, "src/components/Fixture.tsx") });
  return result!.messages.filter((m) => m.ruleId === "no-restricted-syntax");
}

describe("Farb-Lint (brand-design-system)", () => {
  it.each([
    ['export const A = () => <div className="bg-[#ff0000]" />;'],
    ["export const A = () => <p className={`text-[rgb(255,0,0)] p-2`} />;"],
    ['export const A = () => <div style={{ color: "#ff0000" }} />;'],
    ['export const A = () => <div style={{ background: "rgba(0,0,0,.5)" }} />;'],
  ])("meldet undokumentierte Farbe: %s", async (code) => {
    expect(await lint(code)).not.toHaveLength(0);
  });

  it.each([
    ['export const A = () => <div className="bg-bronze-500 text-ink hover:bg-bronze-700" />;'],
    ['export const A = () => <a href="#inhalt">Zum Inhalt</a>;'],
    ['export const A = () => <a href="/kontakt/#formular">Kontakt</a>;'],
  ])("erlaubt Token-Klassen und Anker: %s", async (code) => {
    expect(await lint(code)).toHaveLength(0);
  });

  it("CSS-Dateien außer globals.css enthalten keine Farbliterale", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".css") && !p.endsWith(path.join("styles", "globals.css"))) files.push(p);
      }
    };
    walk(path.join(root, "src"));
    const offenders = files.filter((f) =>
      /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
