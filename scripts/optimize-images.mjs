// performance-budget „Optimierte Bilder“: erzeugt aus den Velite-Bildern (public/static) responsive Varianten
// als AVIF, WebP und JPEG/PNG in festen Breiten. Läuft nach `velite build` (pnpm content) und ist inkrementell.
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const WIDTHS = [400, 800, 1200, 1600, 2000];
const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "public/static");
const out = path.join(src, "opt");

/** Varianten-Dateiname – identisch in src/components/content/ContentImage.tsx */
export const variantName = (file, width, ext) => `${path.parse(file).name}-${width}.${ext}`;

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  await mkdir(out, { recursive: true });
  const files = (await readdir(src)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let created = 0;
  for (const file of files) {
    const input = path.join(src, file);
    const { width = 0 } = await sharp(input).metadata();
    const fallbackExt = /\.png$/i.test(file) ? "png" : "jpg";
    for (const w of WIDTHS.filter((w) => w <= width || w === WIDTHS[0])) {
      const target = Math.min(w, width);
      for (const ext of ["avif", "webp", fallbackExt]) {
        const dest = path.join(out, variantName(file, w, ext));
        if (await exists(dest)) continue;
        let img = sharp(input).rotate().resize({ width: target, withoutEnlargement: true });
        img =
          ext === "avif"
            ? img.avif({ quality: 55, effort: 4 })
            : ext === "webp"
              ? img.webp({ quality: 74 })
              : ext === "png"
                ? img.png({ compressionLevel: 9, palette: true })
                : img.jpeg({ quality: 78, mozjpeg: true, progressive: true });
        await img.toFile(dest);
        created++;
      }
    }
  }
  console.log(`Bildvarianten: ${files.length} Quellen, ${created} neu erzeugt`);
}

if (import.meta.url === `file://${process.argv[1]}`) await run();
