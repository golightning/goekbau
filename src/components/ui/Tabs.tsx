"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

type Tab = { id: string; label: string; content: ReactNode };

/** Zugängliche Tabs (Pfeiltasten, aria-selected, aria-controls) auf Basis von Radix UI. */
export function Tabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  return (
    <RadixTabs.Root defaultValue={tabs[0]?.id}>
      <RadixTabs.List aria-label={label} className="flex flex-wrap gap-2 border-b-2 border-bronze-200">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.id}
            value={tab.id}
            className="-mb-0.5 border-b-2 border-transparent px-4 py-3 font-accent text-sm font-semibold text-slate data-[state=active]:border-bronze-700 data-[state=active]:text-ink"
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content key={tab.id} value={tab.id} className="pt-6">
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
