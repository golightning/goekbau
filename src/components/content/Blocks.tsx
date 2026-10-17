import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, Heading } from "@/components/ui/Layout";
import type { Block } from "@/lib/content";
import { Prose } from "./Prose";

/** Kopf eines Inhaltsblocks: Eyebrow + h2 (+ Fließtext). `id` dient als aria-labelledby-Ziel. */
export function BlockIntro({
  block,
  headingId,
  level = 2,
}: {
  block: Block;
  headingId: string;
  level?: 2 | 3;
}) {
  return (
    <div className="max-w-3xl">
      {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
      {block.title && (
        <Heading level={level} id={headingId}>
          {block.title}
        </Heading>
      )}
      {block.body && <Prose html={block.body} className="mt-5 text-lg" />}
    </div>
  );
}

export function BlockCta({
  block,
  variant = "primary",
}: {
  block: Block;
  variant?: "primary" | "secondary" | "inverse";
}) {
  if (!block.cta) return null;
  return (
    <div className="mt-8">
      <LinkButton href={block.cta.href} variant={variant}>
        {block.cta.label}
      </LinkButton>
    </div>
  );
}

/** Abschluss-Band mit Handlungsaufforderung (dunkel). */
export function CtaBand({ block }: { block: Block }) {
  return (
    <section aria-labelledby={`cta-${block.id}`} className="bg-ink py-16 text-white md:py-20">
      <div className="mx-auto flex max-w-content flex-col items-start gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <Heading level={2} id={`cta-${block.id}`}>
            {block.title}
          </Heading>
          {block.body && <Prose html={block.body} className="mt-4 text-lg text-white/90" />}
        </div>
        {block.cta && (
          <LinkButton href={block.cta.href} variant="inverse">
            {block.cta.label}
          </LinkButton>
        )}
      </div>
    </section>
  );
}
