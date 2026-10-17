import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

// content-model „Schema-Validierung beim Build“: echte `velite build --strict`-Läufe gegen Fixtures.
const root = path.resolve(import.meta.dirname, "../..");
const fixture = path.join(root, "tests/fixtures/content-valid");

function buildWith(mutate?: (dir: string) => void) {
  const tmp = mkdtempSync(path.join(tmpdir(), "goek-content-"));
  const dir = path.join(tmp, "content");
  cpSync(fixture, dir, { recursive: true });
  mutate?.(dir);
  const res = spawnSync("pnpm", ["exec", "velite", "build", "--strict"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      CONTENT_ROOT: dir,
      CONTENT_OUTPUT: path.join(tmp, "out"),
      CONTENT_ASSETS: path.join(tmp, "assets"),
      NO_COLOR: "1",
      FORCE_COLOR: "0",
    },
  });
  const log = `${res.stdout}\n${res.stderr}`.replace(/\x1b\[[0-9;]*m/g, "");
  return { status: res.status, log };
}

function edit(dir: string, file: string, fn: (s: string) => string) {
  const p = path.join(dir, file);
  writeFileSync(p, fn(readFileSync(p, "utf8")));
}

describe("Inhaltsvalidierung (velite --strict)", { timeout: 60_000 }, () => {
  it("baut gültige Inhalte", () => {
    const { status, log } = buildWith();
    expect(status, log).toBe(0);
  });

  it("bricht ab, wenn einer Stelle der Titel fehlt, und nennt Datei und Feld", () => {
    const { status, log } = buildWith((d) =>
      edit(d, "careers/jobs/fbue.md", (s) => s.replace(/^title: .*\n/m, "")),
    );
    expect(status).not.toBe(0);
    expect(log).toMatch(/careers\/jobs\/fbue\.md/);
    expect(log).toMatch(/Required\s+title/);
  });

  it("verlangt Alternativtext oder decorative bei Bildern", () => {
    const { status, log } = buildWith((d) =>
      edit(d, "partners/db.yaml", (s) => s.replace("alt: Logo Partner", "credit: x")),
    );
    expect(status).not.toBe(0);
    expect(log).toMatch(/partners\/db\.yaml/);
    expect(log).toMatch(/Alternativtext/);
  });

  it("verlangt SEO-Beschreibungen mit 70–160 Zeichen", () => {
    const { status, log } = buildWith((d) =>
      edit(d, "pages/home.yaml", (s) => s.replace(/description: .*/, "description: Zu kurz.")),
    );
    expect(status).not.toBe(0);
    expect(log).toMatch(/pages\/home\.yaml/);
    expect(log).toMatch(/seo\.description/);
  });

  it("lehnt doppelte Karriere-Slugs über Stellen und Ausbildungen ab", () => {
    const { status, log } = buildWith((d) =>
      edit(d, "careers/trainings/komplett.md", (s) =>
        s.replace("slug: komplettausbildung", "slug: fachbauueberwacher-oberbau"),
      ),
    );
    expect(status).not.toBe(0);
    expect(log).toMatch(/fachbauueberwacher-oberbau/);
  });

  it("lehnt doppelte SEO-Titel ab", () => {
    const { status, log } = buildWith((d) =>
      edit(d, "legal/impressum.md", (s) => s.replace("title: Impressum Test", "title: Startseite Test")),
    );
    expect(status).not.toBe(0);
    expect(log).toMatch(/doppelter SEO-Titel "Startseite Test"/);
  });

  it("lehnt Leistungen mit unbekanntem Bereich ab", () => {
    const { status, log } = buildWith((d) =>
      edit(d, "services/sicherung.yaml", (s) => s.replace("area: oberbau", "area: gibts-nicht")),
    );
    expect(status).not.toBe(0);
    expect(log).toMatch(/unbekannter Bereich "gibts-nicht"/);
  });
});
