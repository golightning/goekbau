"use client";

import { useEffect, useRef, useState } from "react";
import type { Stage } from "./medallion/stage";
import { withBase } from "@/lib/site-env";

/**
 * GÖK-Logo als 3D-Medaille am Firmensitz im Streckennetz. Zuerst steht ein vorgerendertes Standbild da;
 * three.js lädt erst nach der ersten Nutzeraktion (Zeiger, Scrollen, Touch, Taste) und übernimmt dann
 * mit demselben Bild. Statisch bleibt es bei reduzierter Bewegung, Datensparmodus, schwachen Geräten
 * oder ohne WebGL. Gerendert wird nur sichtbar und nicht angehalten (#hero[data-paused], MotionToggle).
 */
export function HeroMedallion() {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (
      reduce.matches ||
      nav.connection?.saveData ||
      (nav.hardwareConcurrency ?? 4) <= 2 ||
      (nav.deviceMemory ?? 4) <= 2
    ) {
      return;
    }

    const hero = el.closest<HTMLElement>("#hero");
    let disposed = false;
    let interacted = false;
    let visible = false;
    let loading = false;
    let stage: Stage | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let raf = 0;
    let elapsed = 0;
    let last = 0;

    const pixels = () => Math.max(64, Math.round(el.clientWidth * Math.min(window.devicePixelRatio || 1, 2)));
    const running = () =>
      stage !== null && visible && !document.hidden && !reduce.matches && !hero?.hasAttribute("data-paused");

    const frame = (now: number) => {
      elapsed += Math.min(now - last, 100) / 1000; // nach Pausen weiter, ohne Sprung
      last = now;
      stage!.render(elapsed);
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      if (running() && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!running() && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const start = async () => {
      if (loading || !interacted || !visible) return;
      loading = true;
      const { createStage } = await import("./medallion/stage");
      if (disposed) return;
      canvas = document.createElement("canvas");
      canvas.className = "absolute inset-0 size-full opacity-0 transition-opacity duration-700";
      canvas.setAttribute("aria-hidden", "true");
      try {
        stage = createStage(canvas, pixels());
      } catch {
        return; // kein WebGL: das Standbild bleibt
      }
      el.appendChild(canvas);
      stage.render(0);
      requestAnimationFrame(() => {
        canvas?.classList.replace("opacity-0", "opacity-100");
        setLive(true);
      });
      update();
    };

    const interactions = ["pointerdown", "pointermove", "wheel", "scroll", "touchstart", "keydown"] as const;
    const onFirstInteraction = () => {
      interactions.forEach((type) => window.removeEventListener(type, onFirstInteraction));
      interacted = true;
      void start();
    };
    interactions.forEach((type) => window.addEventListener(type, onFirstInteraction, { passive: true }));

    const onPointer = (e: PointerEvent) => {
      if (!stage) return;
      const box = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      stage.pointer(
        clamp(((e.clientX - box.left - box.width / 2) / window.innerWidth) * 2),
        clamp(((e.clientY - box.top - box.height / 2) / window.innerHeight) * 2),
      );
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      void start();
      update();
    });
    io.observe(el);
    const ro = new ResizeObserver(() => stage?.resize(pixels()));
    ro.observe(el);
    const mo = new MutationObserver(update);
    if (hero) mo.observe(hero, { attributes: true, attributeFilter: ["data-paused"] });
    document.addEventListener("visibilitychange", update);
    reduce.addEventListener("change", update);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      interactions.forEach((type) => window.removeEventListener(type, onFirstInteraction));
      window.removeEventListener("pointermove", onPointer);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduce.removeEventListener("change", update);
      stage?.dispose();
      canvas?.remove();
    };
  }, []);

  return (
    <div ref={host} aria-hidden="true" className="relative size-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, Bild ist bereits passend skaliert */}
      <img
        src={withBase("/brand/medaille-240.webp")}
        srcSet={`${withBase("/brand/medaille-240.webp")} 1x, ${withBase("/brand/medaille-480.webp")} 2x`}
        alt=""
        width={240}
        height={240}
        decoding="async"
        fetchPriority="low"
        className={`absolute inset-0 size-full transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}
