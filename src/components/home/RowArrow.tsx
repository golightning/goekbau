/**
 * Runder Pfeil am Ende einer verlinkten Zeile (Leistungen, Karriere). Ruhig als feiner Ring, beim Hover
 * oder Fokus der Zeile (Tailwind-Gruppe) gold gefüllt, der Pfeil rückt ein Stück nach rechts.
 * SVG statt Schriftzeichen, damit Strichstärke und Lage nicht von der Schrift abhängen.
 */
export function RowArrow({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`hp-row-arrow flex size-11 shrink-0 items-center justify-center rounded-full text-white/70 ring-1 ring-white/20 group-hover:bg-bronze-300 group-hover:text-ink group-hover:ring-bronze-300 group-focus-visible:bg-bronze-300 group-focus-visible:text-ink group-focus-visible:ring-bronze-300 ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        className="hp-row-arrow-icon size-5 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 10h11.5M11 5.5 15.5 10 11 14.5" />
      </svg>
    </span>
  );
}
