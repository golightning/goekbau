import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

type Tone = "white" | "mist" | "bronze" | "ink";

const tones: Record<Tone, string> = {
  white: "bg-white text-ink",
  mist: "bg-bronze-50 text-ink",
  bronze: "bg-bronze-100 text-ink",
  ink: "bg-ink text-white",
};

type SectionProps = {
  tone?: Tone;
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ tone = "white", id, labelledBy, className, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx("py-16 md:py-24", tones[tone], className)}>
      <Container>{children}</Container>
    </section>
  );
}

const headingSizes = {
  display: "text-4xl font-extrabold",
  1: "text-3xl font-bold",
  2: "text-2xl font-bold",
  3: "text-xl font-semibold",
  4: "text-lg font-semibold",
} as const;

type HeadingProps = {
  level: 1 | 2 | 3 | 4;
  size?: keyof typeof headingSizes;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** Semantische Ebene (`level`) und optische Größe (`size`) getrennt – für eine lückenlose Hierarchie. */
export function Heading({ level, size, id, className, children }: HeadingProps) {
  const Tag = `h${level}` as ElementType;
  return (
    <Tag id={id} className={cx(headingSizes[size ?? level], className)}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        "mb-3 font-accent text-sm font-semibold tracking-[0.18em] text-bronze-800 uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Card({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cx("rounded-lg border border-bronze-200 bg-white p-6 shadow-sm", className)}>
      {children}
    </Tag>
  );
}
