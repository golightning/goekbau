import type { Image } from "velite";
import { cx } from "@/components/ui/cx";

export type ContentImageData = { src: Image; alt?: string; decorative?: boolean };

type Props = {
  image: ContentImageData;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Einziger Einstiegspunkt für Inhaltsbilder: feste Abmessungen (kein CLS), Lazy-Loading außer beim
 * LCP-Bild, Alt-Text bzw. leerer Alt-Text für dekorative Bilder. Responsive Varianten folgen in Task 10.3.
 */
export function ContentImage({ image, sizes, priority = false, className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- statischer Export, Optimierung in Task 10.3
    <img
      src={image.src.src}
      width={image.src.width}
      height={image.src.height}
      alt={image.decorative ? "" : (image.alt ?? "")}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cx("h-auto w-full", className)}
    />
  );
}
