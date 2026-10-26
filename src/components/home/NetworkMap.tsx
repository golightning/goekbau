import { HeroMedallion } from "./HeroMedallion";
import { BORDER_X, fromHub, HUB, polyline, ROUTES } from "./network";

/**
 * Streckennetz im Hero: leuchtende Projektabschnitte, Anfahrt vom Firmensitz und je Strecke ein Messpunkt,
 * der die Anfahrt und den Abschnitt abfährt (SVG-SMIL, kein JavaScript). Die Endlosbewegung lässt sich über
 * MotionToggle anhalten (WCAG 2.2.2) und entfällt bei reduzierter Bewegung (home.css). Am Firmensitz steht
 * das Logo als 3D-Medaille (HeroMedallion), als Ebene über dem SVG in viewBox-Prozenten positioniert.
 */
export function NetworkMap({ hub, compact = false }: { hub: string; compact?: boolean }) {
  const t = compact ? 2 : 1; // Schriftfaktor der schmalen Fassung
  const id = compact ? "netz-k" : "netz";
  const labels = ROUTES.map((r) => r.label);
  const medal = compact ? 230 : 190; // Durchmesser in viewBox-Einheiten
  const labelX = HUB.x + medal / 2 + 14;
  return (
    <div className="relative">
      <svg viewBox="0 0 1000 560" role="img" aria-labelledby={`${id}-titel`} className="hp-map h-auto w-full">
        <title id={`${id}-titel`}>
          {`Schema der Projektstrecken: vom Firmensitz ${hub} zu den Abschnitten der Strecken ${labels.join(", ")}. Nicht maßstäblich.`}
        </title>
        <defs>
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          {ROUTES.map((r) => (
            <path key={r.slug} id={`${id}-fahrt-${r.slug}`} d={polyline([HUB, ...fromHub(r)])} />
          ))}
        </defs>

        {/* Landesgrenze */}
        <line
          x1={BORDER_X}
          x2={BORDER_X}
          y1="10"
          y2="525"
          stroke="currentColor"
          className="text-white/15"
          strokeWidth="2"
          strokeDasharray="4 10"
        />
        <text
          x={BORDER_X - 16}
          y="550"
          textAnchor="end"
          fontSize={13 * t}
          className="fill-white/65 font-accent tracking-[0.18em] uppercase"
        >
          {compact ? "BW" : "Baden-Württemberg"}
        </text>
        <text
          x={BORDER_X + 16}
          y="550"
          fontSize={13 * t}
          className="fill-white/65 font-accent tracking-[0.18em] uppercase"
        >
          {compact ? "BY" : "Bayern"}
        </text>

        {/* Anfahrt vom Sitz */}
        <g
          fill="none"
          stroke="currentColor"
          className="text-bronze-300/40"
          strokeWidth="1.5"
          strokeDasharray="2 7"
        >
          {ROUTES.map((r) => {
            const first = fromHub(r)[0]!;
            return <line key={r.slug} x1={HUB.x} y1={HUB.y} x2={first.x} y2={first.y} />;
          })}
        </g>

        {/* Leuchten unter den Abschnitten */}
        <g filter={`url(#${id}-glow)`} className="hp-glow" aria-hidden="true">
          {ROUTES.map((r) => (
            <path
              key={r.slug}
              d={polyline(r.stations)}
              fill="none"
              stroke="currentColor"
              className="text-bronze-500"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {ROUTES.map((r, i) => {
          const [lx, ly] = compact && r.tagCompact ? r.tagCompact : r.tag;
          return (
            <g key={r.slug}>
              <path
                d={polyline(r.stations)}
                fill="none"
                stroke="currentColor"
                className="hp-line text-bronze-300"
                style={{ animationDelay: `${0.25 + i * 0.18}s` }}
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
              />
              {r.stations.map((s) => (
                <g key={s.name}>
                  <circle cx={s.x} cy={s.y} r="7" className="fill-ink stroke-white" strokeWidth="3" />
                  {!compact && (
                    <text
                      x={s.x + (s.anchor === "end" ? -16 : s.anchor === "start" ? 16 : 0)}
                      y={s.y + (s.dy ?? 5)}
                      textAnchor={s.anchor ?? "start"}
                      className="fill-white/80 font-accent text-[14px]"
                    >
                      {s.name}
                    </text>
                  )}
                </g>
              ))}
              <rect
                x={lx - 4}
                y={ly - 20 * t}
                width={64 * t}
                height={27 * t}
                rx={3 * t}
                className="fill-bronze-300"
              />
              <text
                x={lx - 4 + 32 * t}
                y={ly - 1.5 * t}
                textAnchor="middle"
                fontSize={16 * t}
                className="fill-ink font-heading font-bold tabular-nums"
              >
                {r.label}
              </text>
            </g>
          );
        })}

        {/* Messpunkte auf Fahrt */}
        <g className="hp-runners" aria-hidden="true">
          {ROUTES.map((r, i) => (
            <circle key={r.slug} r="6" className="fill-white" opacity="0">
              <animateMotion dur="5.5s" begin={`${1.6 + i * 1.3}s`} repeatCount="indefinite">
                <mpath href={`#${id}-fahrt-${r.slug}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.08;0.85;1"
                dur="5.5s"
                begin={`${1.6 + i * 1.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Firmensitz: Wellen hinter der Medaille, Name rechts daneben */}
        <g aria-hidden="true">
          <circle cx={HUB.x} cy={HUB.y} r={medal * 0.23} className="hp-pulse fill-bronze-300/30" />
          <circle cx={HUB.x} cy={HUB.y} r={medal * 0.23} className="hp-pulse hp-pulse-2 fill-bronze-300/30" />
        </g>
        <text x={labelX} y={HUB.y + 7 * t} fontSize={21 * t} className="fill-white font-heading font-bold">
          {hub}
        </text>
        {!compact && (
          <text
            x={labelX}
            y={HUB.y + 30}
            className="fill-bronze-300 font-accent text-[12px] tracking-[0.18em] uppercase"
          >
            Firmensitz
          </text>
        )}

        <text
          x="990"
          y={24 * t}
          textAnchor="end"
          fontSize={12 * t}
          className="fill-white/65 font-accent tracking-[0.12em] uppercase"
        >
          Schema, nicht maßstäblich
        </text>
      </svg>
      <div
        className="pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${HUB.x / 10}%`, top: `${(HUB.y / 560) * 100}%`, width: `${medal / 10}%` }}
      >
        <HeroMedallion />
      </div>
    </div>
  );
}
