import type { ReactNode } from "react";

/** Natives <details>/<summary>: tastaturbedienbar und ohne JavaScript funktionsfähig. */
export function Disclosure({
  summary,
  children,
  defaultOpen,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded-lg border border-bronze-200 bg-white" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading text-lg font-semibold [&::-webkit-details-marker]:hidden">
        {summary}
        <span aria-hidden="true" className="text-bronze-700 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}
