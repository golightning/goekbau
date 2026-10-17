import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "inverse" | "accent";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 font-accent text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60";

// Kontraste geprüft in src/styles/tokens.test.ts (weiß auf bronze-700/800, ink auf bronze-300/500)
const variants: Record<Variant, string> = {
  primary: "bg-bronze-700 text-white hover:bg-bronze-800",
  secondary: "border-2 border-bronze-700 text-bronze-800 hover:bg-bronze-50",
  inverse: "border-2 border-white text-white hover:bg-white hover:text-ink",
  // auf Ink-Flächen: Akzentfläche mit dunkler Schrift (ink auf bronze-500 ≥ 4,5:1)
  accent: "press bg-bronze-500 text-ink hover:bg-bronze-300",
};

export function buttonClasses(variant: Variant = "primary", className?: string): string {
  return cx(base, variants[variant], className);
}

type LinkButtonProps = { href: string; variant?: Variant; className?: string; children: ReactNode };

export function LinkButton({ href, variant = "primary", className, children }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
