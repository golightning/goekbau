import { ContentImage } from "@/components/content/ContentImage";
import type { Page } from "@/lib/content";

/**
 * Hero „Inset photograph, crossing wordmark“ (Richtung „Der Name als Monument“): dunkle Fläche, links das
 * eigene Baustellenfoto mit Bautagebuch-Stempel, rechts ein Satz, unten der Name GÖK so groß, dass er das
 * Foto überschneidet. Die Kopfzeile liegt auf der Startseite transparent darüber (SiteHeader).
 */
export function HomeHero({ hero }: { hero: Page["hero"] }) {
  return (
    <section
      aria-labelledby="seitentitel"
      className="home-hero relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white"
    >
      {hero.image && (
        <div className="relative mx-3 mt-3 h-[58svh] overflow-hidden lg:absolute lg:inset-y-5 lg:left-5 lg:m-0 lg:h-auto lg:w-[47%]">
          <ContentImage
            image={hero.image}
            sizes="(max-width: 1023px) 92vw, 47vw"
            priority
            className="drift h-full object-cover"
          />
        </div>
      )}

      <p className="rise relative z-10 mx-5 mt-6 max-w-[26ch] text-base leading-snug lg:absolute lg:top-[44%] lg:left-[calc(47%+5rem)] lg:m-0 lg:text-xl lg:leading-tight">
        {hero.lead}
      </p>

      <h1
        id="seitentitel"
        className="monument-scroll relative z-10 mt-auto px-4 pb-6 font-heading text-[length:var(--text-monument)] leading-[0.78] font-bold tracking-[-0.05em] lg:absolute lg:right-8 lg:bottom-4 lg:p-0"
      >
        <span className="rise block" style={{ "--i": 1 } as React.CSSProperties}>
          {hero.title}
        </span>
        <span className="sr-only"> Bauüberwachung Bahn</span>
      </h1>
    </section>
  );
}
