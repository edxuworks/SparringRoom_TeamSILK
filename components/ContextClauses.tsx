"use client";

/**
 * components/ContextClauses.tsx — step 3: case background (plain text) + clauses.
 *
 * One view, split into two columns: case background on the LEFT (read as text —
 * NOT voiced), the clauses to choose from on the RIGHT. Each clause card expands
 * to reveal the fine print; a checkbox chooses which to defend. The columns stack
 * on narrow screens. The voice round only begins after this step.
 */

import { useState } from "react";
import type { Case } from "@/data/case";

export function ContextClauses({
  caseData,
  clauseIds,
  onToggleClause,
  onNext,
  onBack,
}: {
  caseData: Case;
  clauseIds: string[];
  onToggleClause: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-5">
      <div className="grid items-start gap-5 md:grid-cols-2">
        {/* LEFT: case background — plain text, read before the round (no voice here) */}
        <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-soft] p-5 shadow-[var(--shadow-soft)] md:sticky md:top-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">
            Case background
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">{caseData.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[--color-text-secondary]">
            {caseData.briefing}
          </p>
        </div>

        {/* RIGHT: clauses — framed to mirror the case-background panel on the left */}
        <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-soft] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">
            Clauses in play
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">
            Pick the ones you&apos;ll defend
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[--color-text-secondary]">
            Tap a clause to read the fine print. Tick the ones you want to argue.
          </p>

          <div className="mt-4 flex flex-col gap-3">
          {caseData.clauses.map((c) => {
            const selected = clauseIds.includes(c.id);
            const isOpen = expanded === c.id;
            return (
              <div
                key={c.id}
                className={
                  "rounded-2xl border bg-white shadow-[var(--shadow-soft)] transition " +
                  (selected
                    ? "border-gold ring-1 ring-gold"
                    : "border-[--color-border]")
                }
              >
                <div className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleClause(c.id)}
                    aria-label={`Argue ${c.label}`}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#c7a45a]"
                  />
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    aria-expanded={isOpen}
                    className="flex flex-1 items-start justify-between gap-3 text-left"
                  >
                    <span>
                      <span className="block font-semibold">{c.label}</span>
                      <span className="mt-0.5 block text-sm text-[--color-text-secondary]">
                        {c.description}
                      </span>
                    </span>
                    <span className="mt-1 shrink-0 text-gold">
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-[--color-border] px-4 py-3 pl-11 text-sm leading-relaxed text-[--color-text-secondary]">
                    {c.details}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

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
          Enter the room →
        </button>
      </div>
    </section>
  );
}
