import Link from "next/link";
import { company } from "@/lib/content";
import { withBase } from "@/lib/site-env";

/** Rasterlogo in 1×/2×/3× (brand-design-system „Logo“), erzeugt von scripts/brand-assets.mjs. */
export function Logo({ priority = false }: { priority?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center"
      aria-label={`${company.shortName} – zur Startseite`}
    >
      <picture>
        <source
          type="image/webp"
          srcSet={`${withBase("/brand/logo-64.webp")} 1x, ${withBase("/brand/logo-128.webp")} 2x, ${withBase("/brand/logo-192.webp")} 3x`}
        />
        <img
          src={withBase("/brand/logo-64.png")}
          srcSet={`${withBase("/brand/logo-128.png")} 2x, ${withBase("/brand/logo-192.png")} 3x`}
          width={72}
          height={64}
          alt=""
          className="h-14 w-auto md:h-16"
          fetchPriority={priority ? "high" : "auto"}
        />
      </picture>
    </Link>
  );
}
