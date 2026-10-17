import { preload } from "react-dom";
import type { Image } from "velite";
import { cx } from "@/components/ui/cx";

export type ContentImageData = { src: Image; alt?: string; decorative?: boolean };

// Muss zu scripts/optimize-images.mjs passen
const WIDTHS = [400, 800, 1200, 1600, 2000];

type Props = {
  image: ContentImageData;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** "/static/name-hash.jpg" → "/static/opt/name-hash-800.webp" */
function variant(src: string, width: number, ext: string): string {
  const file = src.split("/").pop()!;
  const base = file.replace(/\.[^.]+$/, "");
  return `/static/opt/${base}-${width}.${ext}`;
}

/**
 * Einziger Einstiegspunkt für Inhaltsbilder (performance-budget „Optimierte Bilder“): AVIF/WebP mit Fallback,
 * srcset in festen Breiten, feste Abmessungen gegen Layout-Verschiebungen, Lazy-Loading außer beim LCP-Bild.
 */
export function ContentImage({ image, sizes, priority = false, className }: Props) {
  const { src, width, height } = image.src;
  const widths = WIDTHS.filter((w) => w <= width || w === WIDTHS[0]);
  const fallbackExt = /\.png$/i.test(src) ? "png" : "jpg";
  const srcSet = (ext: string) =>
    widths.map((w) => `${variant(src, w, ext)} ${Math.min(w, width)}w`).join(", ");
  const fallbackWidth = widths.find((w) => w >= 800) ?? widths[widths.length - 1]!;
  if (priority) {
    // LCP-Bild sofort im <head> anfordern statt erst beim Parsen von <picture> (performance-budget)
    preload(variant(src, fallbackWidth, "avif"), {
      as: "image",
      type: "image/avif",
      imageSrcSet: srcSet("avif"),
      imageSizes: sizes,
      fetchPriority: "high",
    });
  }
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={variant(src, fallbackWidth, fallbackExt)}
        srcSet={srcSet(fallbackExt)}
        sizes={sizes}
        width={width}
        height={height}
        alt={image.decorative ? "" : (image.alt ?? "")}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={cx("h-auto w-full", className)}
      />
    </picture>
  );
}
