"use client";

/**
 * components/CaseSelect.tsx — step 1: pick case / battlefield.
 * Lists the case registry (data/cases.ts).
 */

import { Landmark } from "lucide-react";
import type { Case } from "@/data/case";

export function CaseSelect({
  cases,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: {
  cases: Case[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        Pick your case
      </h2>

      <div className="flex flex-col gap-3">
        {cases.map((c) => {
          const selected = c.id === selectedId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={
                "flex items-start gap-4 rounded-2xl border bg-white p-4 text-left shadow-[var(--shadow-soft)] transition " +
                (selected
                  ? "border-gold ring-1 ring-gold"
                  : "border-[--color-border] hover:border-gold/50")
              }
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                <Landmark className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span>
                <span className="block font-semibold">{c.title}</span>
                <span className="mt-1 block text-sm text-[--color-text-secondary]">
                  {c.issue}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <NavRow onBack={onBack} onNext={onNext} />
    </section>
  );
}

function NavRow({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onBack}
        className="rounded-lg border border-[--color-border-strong] px-4 py-2 text-sm font-medium hover:bg-[--color-surface-soft]"
      >
        ← Back
      </button>
      <button
        onClick={onNext}
        className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover"
      >
        Next →
      </button>
    </div>
  );
}
