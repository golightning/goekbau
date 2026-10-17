"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cx } from "@/components/ui/cx";
import { isActive, mainNav } from "@/lib/navigation";

const linkBase = "rounded-full px-4 py-2 font-accent text-[0.95rem] font-medium transition-colors";

/** Desktop: Linkliste. Mobil (< 1024 px): Menü-Button mit Dialog – Escape, Fokusfalle und Fokus-Rückgabe via Radix. */
export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (onNavigate?: () => void) =>
    mainNav.map((item) => {
      const active = isActive(item.href, pathname);
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cx(linkBase, active ? "bg-bronze-700 text-white" : "text-ink hover:bg-bronze-100")}
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

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-bronze-700 px-4 font-accent text-sm font-semibold text-bronze-800 lg:hidden">
          <span aria-hidden="true" className="text-lg leading-none">
            ☰
          </span>
          Menü
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/60" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,100vw)] flex-col gap-6 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-heading text-xl font-bold">Menü</Dialog.Title>
              <Dialog.Close className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-bronze-700 font-accent text-sm font-semibold text-bronze-800">
                <span aria-hidden="true">✕</span>
                <span className="sr-only">Menü schließen</span>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Hauptnavigation der Website</Dialog.Description>
            <nav aria-label="Hauptnavigation (mobil)">
              <ul className="flex flex-col gap-2 [&_a]:block [&_a]:py-3 [&_a]:text-lg">
                {links(() => setOpen(false))}
              </ul>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
