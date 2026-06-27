"use client";

/**
 * components/OpponentSelect.tsx — step 2: pick opponent (personality + difficulty).
 */

import { PERSONAS } from "@/data/personas";
import { DIFFICULTIES } from "@/data/difficulties";

export function OpponentSelect({
  personaId,
  difficultyId,
  onPersona,
  onDifficulty,
  onNext,
  onBack,
}: {
  personaId: string;
  difficultyId: string;
  onPersona: (id: string) => void;
  onDifficulty: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Pick your opponent
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PERSONAS.map((p) => {
            const selected = p.id === personaId;
            return (
              <button
                key={p.id}
                onClick={() => onPersona(p.id)}
                className={
                  "flex flex-col items-center gap-2 rounded-2xl border bg-white p-5 text-center shadow-[var(--shadow-soft)] transition " +
                  (selected
                    ? "border-gold ring-1 ring-gold"
                    : "border-[--color-border] hover:border-gold/50")
                }
              >
                <span
                  className={
                    "flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border " +
                    (selected
                      ? "border-gold bg-gold/10"
                      : "border-[--color-border] bg-[--color-surface-soft]")
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.label}
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                  />
                </span>
                <span className="font-semibold">{p.label}</span>
                <span className="text-xs text-[--color-text-secondary]">
                  {p.blurb}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[--color-text-secondary]">
          Difficulty
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => {
            const selected = d.id === difficultyId;
            return (
              <button
                key={d.id}
                onClick={() => onDifficulty(d.id)}
                title={d.blurb}
                className={
                  "rounded-lg border px-3 py-2 text-sm transition " +
                  (selected
                    ? "border-ink bg-ink text-white"
                    : "border-[--color-border-strong] hover:border-gold/50")
                }
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[--color-text-muted]">
          {DIFFICULTIES.find((d) => d.id === difficultyId)?.blurb}
        </p>
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
          Next →
        </button>
      </div>
    </section>
  );
}
