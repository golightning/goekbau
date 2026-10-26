"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui/cx";
import { isActive, mainNav } from "@/lib/navigation";

const linkBase = "rounded-full px-4 py-2 font-accent text-[0.95rem] font-semibold transition-colors";

/**
 * Desktop: Linkliste. Mobil (< 1024 px): Menü-Button mit nativem <dialog> (showModal): Fokusfalle, Escape und
 * inerter Hintergrund kommen vom Browser; der Fokus kehrt beim Schließen zum Button zurück (site-navigation).
 * Natives <dialog> statt Radix spart ~10 KB JavaScript auf jeder Seite (performance-budget).
 * tone="dark": Fassung für den dunklen Header der Startseite; das Menü-Dialogfenster bleibt hell.
 */
export function MainNav({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => setOpen(false);

  const links = (onNavigate?: () => void) =>
    mainNav.map((item) => {
      const active = isActive(item.href, pathname);
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cx(
              linkBase,
              active
                ? dark && !onNavigate
                  ? "bg-bronze-300 text-ink"
                  : "bg-bronze-700 text-white"
                : dark && !onNavigate
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-ink hover:bg-bronze-100",
            )}
          >
            {item.label}
          </Link>
        </li>
      );
    });

  return (
    <>
      <nav aria-label="Hauptnavigation" className="hidden lg:block">
        <ul className="flex items-center gap-1">{links()}</ul>
      </nav>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="menu-dialog"
        onClick={() => setOpen(true)}
        className={cx(
          "inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-accent text-sm font-semibold lg:hidden",
          dark ? "border-white/40 text-white" : "border-bronze-700 text-bronze-800",
        )}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ☰
        </span>
        Menü
      </button>

      <dialog
        id="menu-dialog"
        ref={dialogRef}
        aria-labelledby="menu-dialog-title"
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(e) => {
          // Klick auf den abgedunkelten Hintergrund (das <dialog> selbst) schließt
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(22rem,100vw)] max-w-none bg-white p-6 shadow-xl backdrop:bg-ink/60"
      >
        <div className="flex items-center justify-between">
          <h2 id="menu-dialog-title" className="font-heading text-xl font-bold">
            Menü
          </h2>
          <button
            type="button"
            onClick={close}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-bronze-700 font-accent text-sm font-semibold text-bronze-800"
          >
            <span aria-hidden="true">✕</span>
            <span className="sr-only">Menü schließen</span>
          </button>
        </div>
        <nav aria-label="Hauptnavigation (mobil)" className="mt-6">
          <ul className="flex flex-col gap-2 [&_a]:block [&_a]:py-3 [&_a]:text-lg">{links(close)}</ul>
        </nav>
      </dialog>
    </>
  );
}
