// Erzeugt Logo-Varianten, Favicons und das Standard-OG-Bild aus den Master-Dateien (Task 2.4).
// Aufruf: pnpm brand:assets  – Ergebnisse werden eingecheckt, damit der Build ohne sharp-Lauf auskommt.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const master = path.join(root, "content/media/brand/logo-goek.png");
const ogPhoto = path.join(root, "content/media/photos/railway-track-pixabay-2049394.jpg");
const publicBrand = path.join(root, "public/brand");
const appDir = path.join(root, "src/app");
await mkdir(publicBrand, { recursive: true });

// Transparente Ränder entfernen, damit die Marke die volle Fläche nutzt.
const trimmed = await sharp(master).trim().png().toBuffer();
const mark = await sharp(trimmed).metadata();
console.log(`Logo getrimmt: ${mark.width}×${mark.height}`);

// Header-Logo: 1× / 2× / 3× für ~ 64 px Darstellungshöhe
for (const h of [64, 128, 192]) {
  await sharp(trimmed)
    .resize({ height: h })
    .webp({ quality: 90 })
    .toFile(path.join(publicBrand, `logo-${h}.webp`));
  await sharp(trimmed)
    .resize({ height: h })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicBrand, `logo-${h}.png`));
}

// Nur das runde Signet (ohne Schriftzug) für Favicons: obere quadratische Fläche des getrimmten Logos
const square = Math.min(mark.width, mark.height);
const emblem = await sharp(trimmed)
  .extract({
    left: Math.round((mark.width - square * 0.8) / 2),
    top: 0,
    width: Math.round(square * 0.8),
    height: Math.round(square * 0.8),
  })
  .png()
  .toBuffer();

async function iconOn(bg, size, padding) {
  const inner = Math.round(size * (1 - padding * 2));
  const fg = await sharp(emblem)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: fg, gravity: "center" }])
    .png({ compressionLevel: 9, palette: true, quality: 90 });
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const white = { r: 255, g: 255, b: 255, alpha: 1 };
await (await iconOn(transparent, 512, 0.02)).toFile(path.join(appDir, "icon.png"));
await (await iconOn(white, 180, 0.08)).toFile(path.join(appDir, "apple-icon.png"));
await (await iconOn(transparent, 192, 0.02)).toFile(path.join(publicBrand, "icon-192.png"));

// favicon.ico (32 px PNG im ICO-Container)
const png32 = await (await iconOn(transparent, 32, 0)).toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(path.join(appDir, "favicon.ico"), Buffer.concat([header, png32]));

// Standard-OG-Bild 1200×630: Bahnfoto abgedunkelt + Logo (seo-metadata „Seite ohne eigenes Bild“)
const logoOg = await sharp(trimmed).resize({ height: 420 }).toBuffer();
await sharp(ogPhoto)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .modulate({ brightness: 0.45, saturation: 0.8 })
  .composite([{ input: logoOg, gravity: "center" }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(publicBrand, "og-default.jpg"));

console.log("Brand-Assets erzeugt: public/brand/*, src/app/{icon.png,apple-icon.png,favicon.ico}");
