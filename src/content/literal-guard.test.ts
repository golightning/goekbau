import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { findMasterDataLiterals } from "./literal-guard";

const root = path.resolve(import.meta.dirname, "../..");

function companyValues(): string[] {
  const file = path.join(root, "content/company.yaml");
  if (!existsSync(file)) return [];
  const c = parse(readFileSync(file, "utf8"));
  return [
    c.phone?.display,
    c.phone?.e164,
    c.whatsapp?.e164,
    c.address?.street,
    ...(c.emails ?? []).map((e: { address: string }) => e.address),
  ].filter(Boolean);
}

describe("Stammdaten-Wächter", () => {
  it.each([
    ['const tel = "+49 162 1991444";', "Telefon"],
    ['<a href="tel:01621991444">', "Telefon"],
    ['const mail = "info@goekbau.de";', "E-Mail"],
  ])("meldet %s", (code, kind) => {
    expect(findMasterDataLiterals(code).map((f) => f.kind)).toContain(kind);
  });

  it("meldet bekannte Stammdaten wie die Anschrift", () => {
    expect(findMasterDataLiterals("<p>Max-Planck-Straße 16</p>", ["Max-Planck-Straße 16"])).toHaveLength(1);
  });

  it("lässt normalen Code in Ruhe", () => {
    expect(findMasterDataLiterals('const year = 2026; const w = "1200px";')).toEqual([]);
  });

  it("findet keine Stammdaten-Literale im Komponentencode", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (
          /\.(tsx?|css)$/.test(p) &&
          !/\.test\.tsx?$/.test(p) &&
          !p.includes(`${path.sep}content${path.sep}`)
        )
          files.push(p);
      }
    };
    walk(path.join(root, "src"));
    const known = companyValues();
    const offenders = files.flatMap((f) =>
      findMasterDataLiterals(readFileSync(f, "utf8"), known).map(
        (x) => `${path.relative(root, f)}:${x.line} ${x.kind}: ${x.text}`,
      ),
    );
    expect(offenders).toEqual([]);
  });
});
