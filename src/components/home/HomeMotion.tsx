"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Alle Client-Bausteine der Startseite in einem Modul: ein Script-Chunk statt drei (performance-budget,
// Ressourcen-Budget der Startseite in lighthouserc.cjs).

const fmt = new Intl.NumberFormat("de-DE");

/**
 * Zählt beim ersten Sichtkontakt hoch. Server-HTML, reduzierte Bewegung, bereits sichtbare Werte und
 * Jahreszahlen (grouping = false) zeigen sofort den Endwert.
 */
export function CountUp({ value, grouping = true }: { value: number; grouping?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !grouping || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < innerHeight * 0.9) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - start) / 1600);
          setN(k < 1 ? Math.round(value * (1 - Math.pow(2, -10 * k))) : value);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, grouping]);

  return (
    <span ref={ref} className="tabular-nums">
      {grouping ? fmt.format(n) : n}
    </span>
  );
}

/**
 * Projekte als Fahrt entlang eines Gleises: Ab md und ohne reduzierte Bewegung bleibt der Abschnitt stehen,
 * während vertikales Scrollen die Stationen seitlich vorbeiziehen lässt. Ohne JavaScript, auf dem Handy und
 * bei reduzierter Bewegung bleibt es eine senkrechte Liste (data-mode fehlt, home.css).
 */
export function TrackScroller({ children, rail }: { children: ReactNode; rail: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current;
    const v = viewport.current;
    const s = strip.current;
    if (!o || !v || !s) return;
    const mq = matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    let dist = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!mq.matches) return;
      const r = o.getBoundingClientRect();
      const span = r.height - v.clientHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      s.style.transform = `translate3d(${-p * dist}px,0,0)`;
      o.style.setProperty("--p", p.toFixed(4));
    };
    const layout = () => {
      if (!mq.matches) {
        delete o.dataset.mode;
        o.style.height = "";
        s.style.transform = "";
        o.style.removeProperty("--p");
        return;
      }
      o.dataset.mode = "scroll";
      dist = Math.max(0, s.scrollWidth - v.clientWidth);
      o.style.height = `${v.clientHeight + dist}px`;
      update();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Tastatur: Fokus auf einer seitlich verschobenen Station scrollt die Seite an deren Position, statt dass der
    // Browser den Ausschnitt (overflow: hidden) selbst verschiebt.
    const onFocus = (e: FocusEvent) => {
      if (!mq.matches || dist === 0) return;
      v.scrollLeft = 0;
      const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-panel]");
      if (!panel) return;
      const centre = panel.offsetLeft + panel.offsetWidth / 2 - v.clientWidth / 2;
      const p = Math.min(1, Math.max(0, centre / dist));
      const top = o.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + p * (o.offsetHeight - v.clientHeight), behavior: "instant" });
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(s);
    ro.observe(v);
    mq.addEventListener("change", layout);
    addEventListener("scroll", onScroll, { passive: true });
    s.addEventListener("focusin", onFocus);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", layout);
      removeEventListener("scroll", onScroll);
      s.removeEventListener("focusin", onFocus);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={outer} className="hp-track relative">
      <div ref={viewport} className="hp-track-viewport">
        <div ref={strip} className="hp-track-strip">
          {children}
        </div>
        {rail}
      </div>
    </div>
  );
}

/**
 * WCAG 2.2.2 (Pausieren, Beenden, Ausblenden): hält die Endlosbewegung im Hero an – CSS-Animationen über
 * data-paused (home.css), die SMIL-Messpunkte über SVGSVGElement.pauseAnimations(). Bei reduzierter Bewegung
 * läuft nichts endlos, der Schalter ist dann ausgeblendet.
 */
export function MotionToggle({ scope }: { scope: string }) {
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const el = document.getElementById(scope);
    if (!el) return;
    const next = !paused;
    if (next) el.dataset.paused = "";
    else delete el.dataset.paused;
    el.querySelectorAll("svg").forEach((svg) => (next ? svg.pauseAnimations() : svg.unpauseAnimations()));
    setPaused(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-accent text-xs tracking-[0.12em] text-white/80 uppercase ring-1 ring-white/25 transition-colors hover:text-white hover:ring-white/60 motion-reduce:hidden"
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {paused ? "▶" : "❚❚"}
      </span>
      {paused ? "Animation fortsetzen" : "Animation anhalten"}
    </button>
  );
}
