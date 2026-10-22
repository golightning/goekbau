#!/usr/bin/env node
// Referenz der Live-Seiten für Umbauten ohne Verhaltensänderung (redesign-home-page, Aufgabe 2.1/2.2).
// Byte-gleiches HTML ist kein Maßstab, weil Next.js interne Routingdaten ins HTML schreibt. Verglichen werden
// stattdessen gerenderte Struktur, Texte, Links, Metadaten und Screenshots.
//
//   node scripts/page-snapshot.mjs snap <baseURL> <dir>   Referenz aufnehmen
//   node scripts/page-snapshot.mjs diff <dirA> <dirB>     zwei Referenzen vergleichen (Exit 1 bei Unterschied)
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const VIEWPORTS = [
  [1500, 750],
  [390, 844],
];
// Anteil abweichender Pixel, der als Kantenglättung gilt; Abweichung je Kanal ab der ein Pixel zählt
const PIXEL_TOLERANCE = 0.002;
const CHANNEL_THRESHOLD = 40;
const NOT_FOUND_PATH = "/gibt-es-nicht/";

const slug = (path) => (path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "__"));

async function routes(baseURL) {
  const xml = await (await fetch(new URL("/sitemap.xml", baseURL))).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  return [...new Set([...paths, "/styleguide/", NOT_FOUND_PATH])];
}

function extract() {
  const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const attr = (sel, a) => document.querySelector(sel)?.getAttribute(a) ?? null;
  return {
    landmarks: [...document.querySelectorAll("header, nav, main, footer, aside, [role]")].map((el) => ({
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      label: el.getAttribute("aria-label"),
    })),
    headings: [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => `${h.tagName}: ${norm(h.textContent)}`),
    text: norm(document.body.innerText),
    links: [...document.querySelectorAll("a[href]")].map((a) => `${a.getAttribute("href")} | ${norm(a.textContent)}`),
    meta: {
      lang: document.documentElement.lang,
      title: document.title,
      description: attr('meta[name="description"]', "content"),
      robots: attr('meta[name="robots"]', "content"),
      canonical: attr('link[rel="canonical"]', "href"),
      og: Object.fromEntries(
        [...document.querySelectorAll('meta[property^="og:"]')].map((m) => [m.getAttribute("property"), m.getAttribute("content")]),
      ),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)),
    },
  };
}

async function snap(baseURL, dir) {
  await mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  const list = await routes(baseURL);
  for (const path of list) {
    const result = {};
    for (const [w, h] of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const res = await page.goto(new URL(path, baseURL).href, { waitUntil: "networkidle" });
      // Lazy-Bilder: jedes Bild in den Blick holen und warten, bis es dekodiert ist; dann zurück nach oben
      await page.evaluate(async () => {
        for (const img of document.querySelectorAll("img")) {
          img.scrollIntoView({ block: "center" });
          if (!img.complete)
            await new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
            });
          await img.decode().catch(() => undefined);
        }
        scrollTo(0, 0);
        await document.fonts.ready;
      });
      await page.waitForLoadState("networkidle");
      if (w === VIEWPORTS[0][0]) Object.assign(result, { status: res?.status() ?? null, ...(await page.evaluate(extract)) });
      await page.screenshot({ path: join(dir, `${slug(path)}-${w}.png`), fullPage: true, animations: "disabled" });
      await page.close();
    }
    await writeFile(join(dir, `${slug(path)}.json`), JSON.stringify({ path, ...result }, null, 2));
    console.log(`  ${path}  (${result.status})`);
  }
  await browser.close();
  console.log(`${list.length} Routen → ${dir}`);
}

async function pixelDiff(a, b) {
  const [ia, ib] = await Promise.all([a, b].map((f) => sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (ia.info.width !== ib.info.width || ia.info.height !== ib.info.height)
    return `Größe ${ia.info.width}×${ia.info.height} ≠ ${ib.info.width}×${ib.info.height}`;
  let differing = 0;
  for (let i = 0; i < ia.data.length; i += 4) {
    const d = Math.max(
      Math.abs(ia.data[i] - ib.data[i]),
      Math.abs(ia.data[i + 1] - ib.data[i + 1]),
      Math.abs(ia.data[i + 2] - ib.data[i + 2]),
    );
    if (d > CHANNEL_THRESHOLD) differing++;
  }
  const ratio = differing / (ia.info.width * ia.info.height);
  return ratio > PIXEL_TOLERANCE ? `${(ratio * 100).toFixed(2)} % Pixel abweichend` : null;
}

async function diff(dirA, dirB) {
  const files = (await readdir(dirA)).sort();
  const problems = [];
  for (const f of files) {
    const a = join(dirA, f);
    const b = join(dirB, f);
    let other;
    try {
      other = await readFile(b);
    } catch {
      problems.push(`${f}: fehlt in ${dirB}`);
      continue;
    }
    if (f.endsWith(".json")) {
      const ja = JSON.parse(await readFile(a, "utf8"));
      const jb = JSON.parse(other.toString("utf8"));
      for (const key of Object.keys({ ...ja, ...jb })) {
        if (JSON.stringify(ja[key]) !== JSON.stringify(jb[key])) problems.push(`${f}: „${key}“ unterschiedlich`);
      }
    } else if (f.endsWith(".png")) {
      const msg = await pixelDiff(a, b);
      if (msg) problems.push(`${f}: ${msg}`);
    }
  }
  const extra = (await readdir(dirB)).filter((f) => !files.includes(f));
  for (const f of extra) problems.push(`${f}: nur in ${dirB}`);
  if (problems.length) {
    console.log(`✘ ${problems.length} Unterschied(e):\n  ` + problems.join("\n  "));
    process.exit(1);
  }
  console.log(`✔ ${files.length} Dateien ohne Unterschied`);
}

const [mode, a, b] = process.argv.slice(2);
if (mode === "snap" && a && b) await snap(a, b);
else if (mode === "diff" && a && b) await diff(a, b);
else {
  console.error("usage: page-snapshot.mjs snap <baseURL> <dir> | diff <dirA> <dirB>");
  process.exit(2);
}
