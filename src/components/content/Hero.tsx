import type { ReactNode } from "react";
import { Container } from "@/components/ui/Layout";
import type { Page } from "@/lib/content";
import { ContentImage } from "./ContentImage";

/** Seitenkopf mit genau einer h1. Mit Foto: dunkles Overlay für ≥ 4,5:1 Kontrast (accessibility). */
export function Hero({ hero, children }: { hero: Page["hero"]; children?: ReactNode }) {
  const withImage = Boolean(hero.image);
  return (
    <section
      aria-labelledby="seitentitel"
      className={withImage ? "relative isolate overflow-hidden bg-ink text-white" : "bg-bronze-50 text-ink"}
    >
      {hero.image && (
        <div className="absolute inset-0 -z-10">
          <ContentImage image={hero.image} sizes="100vw" priority className="h-full object-cover" />
          <div className="absolute inset-0 bg-ink/75" />
        </div>
      )}
      <Container className={withImage ? "py-24 md:py-36" : "py-16 md:py-24"}>
        {hero.eyebrow && (
          <p
            className={`mb-4 font-accent text-sm font-semibold tracking-[0.18em] uppercase ${withImage ? "text-bronze-300" : "text-bronze-800"}`}
          >
            {hero.eyebrow}
          </p>
        )}
        <h1 id="seitentitel" className="max-w-4xl text-4xl font-extrabold">
          {hero.title}
        </h1>
        {hero.lead && <p className="mt-6 max-w-2xl text-lg md:text-xl">{hero.lead}</p>}
        {children && <div className="mt-10 flex flex-wrap gap-4">{children}</div>}
      </Container>
    </section>
  );
}
