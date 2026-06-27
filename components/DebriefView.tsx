"use client";

/**
 * components/DebriefView.tsx — the hot-seat debrief (Phase 4).
 *
 * Renders the Technician's debrief, grounded in the firm rulebook: health score,
 * consequence framework, what you got right, gaps (legal + commercial + correct
 * position), faulty assumptions, trap clauses picked, top learning points, and
 * what to resolve before going back to the partner.
 */

import type { CoachResult } from "@/prompts/coach";

function scoreColor(s: number): string {
  if (s >= 75) return "text-green-700";
  if (s >= 50) return "text-amber-600";
  return "text-red-600";
}

export function DebriefView({
  debrief,
  scoring,
  error,
  onRetry,
  onGoAgain,
}: {
  debrief: CoachResult | null;
  scoring: boolean;
  error?: string | null;
  onRetry?: () => void;
  onGoAgain: () => void;
}) {
  if (scoring) {
    return (
      <section className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[--color-border] bg-white shadow-[var(--shadow-soft)]">
        <p className="text-sm text-[--color-text-secondary]">Scoring your hot seat…</p>
      </section>
    );
  }

  if (error && !debrief) {
    return (
      <section className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-[--color-border] bg-white p-6 text-center shadow-[var(--shadow-soft)]">
        <p className="text-sm text-red-700">{error}</p>
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover"
            >
              Try again
            </button>
          )}
          <button
            onClick={onGoAgain}
            className="rounded-lg border border-[--color-border] px-5 py-2 text-sm font-medium transition hover:bg-[--color-surface-soft]"
          >
            Go Again
          </button>
        </div>
      </section>
    );
  }

  if (!debrief) {
    return (
      <section className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[--color-border] bg-white shadow-[var(--shadow-soft)]">
        <p className="text-sm text-[--color-text-secondary]">Scoring your hot seat…</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-card)]">
      {/* Health score + headline */}
      <div className="flex items-center gap-5">
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-gold/40">
          <span
            className={"font-heading text-3xl font-semibold tabular-nums " + scoreColor(debrief.score)}
          >
            {debrief.score}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[--color-text-muted]">
            / 100
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">
            Overall score
          </p>
          <p className="mt-1 text-sm text-[--color-text-primary]">{debrief.headline}</p>
        </div>
        {debrief.trapsPicked?.length > 0 && (
          <span className="shrink-0 self-start rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            Trap clause defended
          </span>
        )}
      </div>

      {debrief.gaps?.length > 0 && (
        <Block title="Gaps in your analysis">
          <ul className="space-y-3">
            {debrief.gaps.map((g, i) => (
              <li
                key={i}
                className="rounded-lg border border-[--color-border] p-3 text-sm"
              >
                <p className="font-medium">{g.issue}</p>
                <p className="mt-1 text-[--color-text-primary]">
                  <span className="text-gold">Gold standard:</span> {g.correct}
                </p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {debrief.trapsPicked?.length > 0 && (
        <Block title="Trap clauses you defended">
          <ul className="space-y-1 text-sm text-red-700">
            {debrief.trapsPicked.map((t, i) => (
              <li key={i}>• {t}</li>
            ))}
          </ul>
        </Block>
      )}

      {debrief.learningPoints?.length > 0 && (
        <Block title="Top learning points">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-[--color-text-secondary]">
            {debrief.learningPoints.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
        </Block>
      )}

      <button
        onClick={onGoAgain}
        className="self-start rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover"
      >
        Go Again
      </button>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gold">
        {title}
      </p>
      {children}
    </div>
  );
}
