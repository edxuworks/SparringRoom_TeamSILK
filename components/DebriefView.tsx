"use client";

/**
 * components/DebriefView.tsx — the hot-seat debrief (Phase 4), as an ANNOTATED
 * TRANSCRIPT.
 *
 * Top: performance summary (health score, headline, key indicators, trap badge).
 * Below: the round's transcript rendered as a document with key passages
 * highlighted (green = good, rose = bad) and a sticky side panel explaining the
 * active highlight. Prev/Next (and clicking a highlight) auto-scrolls the document
 * to that passage. Quotes are matched verbatim against the turn text; if a quote
 * can't be located inline it falls back to a clickable chip on that turn.
 */

import { useEffect, useRef, useState } from "react";
import type { CoachResult } from "@/prompts/coach";
import type { Turn } from "@/components/types";

function scoreColor(s: number): string {
  if (s >= 75) return "text-green-700";
  if (s >= 50) return "text-amber-600";
  return "text-red-600";
}

const isGood = (v: string) => v === "good";

export function DebriefView({
  debrief,
  transcript,
  scoring,
  error,
  onRetry,
  onGoAgain,
}: {
  debrief: CoachResult | null;
  transcript: Turn[];
  scoring: boolean;
  error?: string | null;
  onRetry?: () => void;
  onGoAgain: () => void;
}) {
  const [active, setActive] = useState(0);
  const markRefs = useRef<(HTMLElement | null)[]>([]);
  const annotations = debrief?.annotations ?? [];

  // Scroll the active highlight into view whenever it changes.
  useEffect(() => {
    markRefs.current[active]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  if (scoring) {
    return <Centered>Scoring your hot seat…</Centered>;
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
    return <Centered>Scoring your hot seat…</Centered>;
  }

  const go = (i: number) => {
    if (annotations.length === 0) return;
    setActive((i + annotations.length) % annotations.length);
  };
  const activeAnn = annotations[active];

  return (
    <section className="flex flex-col gap-6">
      {/* ── Performance summary ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-gold/40">
            <span className={"font-heading text-3xl font-semibold tabular-nums " + scoreColor(debrief.score)}>
              {debrief.score}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-[--color-text-muted]">
              / 100
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gold">
              Performance summary
            </p>
            <p className="mt-1 text-sm text-[--color-text-primary]">{debrief.headline}</p>
          </div>
          {debrief.trapsPicked?.length > 0 && (
            <span className="shrink-0 self-start rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              Trap clause defended
            </span>
          )}
        </div>

        {debrief.summary?.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {debrief.summary.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-[--color-text-secondary]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-gold" />
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Annotated transcript ────────────────────────────────────── */}
      <div className="grid items-start gap-5 md:grid-cols-[1.6fr_1fr]">
        {/* LEFT: the document */}
        <div className="flex flex-col gap-3">
          {transcript.map((turn, ti) => {
            const turnAnns = annotations
              .map((a, idx) => ({ ...a, idx }))
              .filter((a) => a.turn === ti);
            return (
              <div
                key={ti}
                className="rounded-2xl border border-[--color-border] bg-white p-4 shadow-[var(--shadow-soft)]"
              >
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[--color-text-muted]">
                  {turn.role === "user" ? "You" : "The Technician"}
                </p>
                <p className="text-sm leading-relaxed text-[--color-text-primary]">
                  {renderTurn(turn.text, turnAnns, active, setActive, markRefs)}
                </p>
                {/* Fallback chips for annotations whose quote wasn't found inline */}
                {turnAnns
                  .filter((a) => !turn.text.toLowerCase().includes(a.quote.toLowerCase()))
                  .map((a) => (
                    <button
                      key={a.idx}
                      ref={(el) => {
                        markRefs.current[a.idx] = el;
                      }}
                      onClick={() => setActive(a.idx)}
                      className={
                        "mt-2 mr-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition " +
                        chipClass(a.verdict, a.idx === active)
                      }
                    >
                      ● {a.label}
                    </button>
                  ))}
              </div>
            );
          })}
        </div>

        {/* RIGHT: sticky commentary panel */}
        <div className="md:sticky md:top-4">
          {activeAnn ? (
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-soft] p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                    (isGood(activeAnn.verdict)
                      ? "bg-green-100 text-green-800"
                      : "bg-rose-100 text-rose-800")
                  }
                >
                  {isGood(activeAnn.verdict) ? "Strong" : "Weak"}
                </span>
                <span className="text-xs text-[--color-text-muted]">
                  {active + 1} / {annotations.length}
                </span>
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold">{activeAnn.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[--color-text-secondary]">
                {activeAnn.comment}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => go(active - 1)}
                  className="flex-1 rounded-lg border border-[--color-border-strong] px-3 py-2 text-sm font-medium hover:bg-white"
                >
                  ↑ Prev
                </button>
                <button
                  onClick={() => go(active + 1)}
                  className="flex-1 rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-hover"
                >
                  Next ↓
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface-soft] p-5 text-sm text-[--color-text-secondary] shadow-[var(--shadow-soft)]">
              No specific passages were flagged this round.
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onGoAgain}
        className="self-start rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover"
      >
        Go Again
      </button>
    </section>
  );
}

/** Render a turn's text with each annotation's verbatim quote highlighted inline. */
function renderTurn(
  text: string,
  turnAnns: { idx: number; quote: string; verdict: string }[],
  active: number,
  setActive: (i: number) => void,
  markRefs: React.MutableRefObject<(HTMLElement | null)[]>,
) {
  // Locate each quote; keep non-overlapping intervals in document order.
  const lower = text.toLowerCase();
  const intervals = turnAnns
    .map((a) => {
      const start = lower.indexOf(a.quote.toLowerCase());
      return start === -1
        ? null
        : { start, end: start + a.quote.length, idx: a.idx, verdict: a.verdict };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.start - b.start);

  const kept: typeof intervals = [];
  let lastEnd = -1;
  for (const iv of intervals) {
    if (iv.start >= lastEnd) {
      kept.push(iv);
      lastEnd = iv.end;
    }
  }
  if (kept.length === 0) return text;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  kept.forEach((iv, k) => {
    if (iv.start > cursor) nodes.push(<span key={`t${k}`}>{text.slice(cursor, iv.start)}</span>);
    nodes.push(
      <mark
        key={`m${k}`}
        ref={(el) => {
          markRefs.current[iv.idx] = el;
        }}
        onClick={() => setActive(iv.idx)}
        className={"cursor-pointer rounded px-0.5 transition " + markClass(iv.verdict, iv.idx === active)}
      >
        {text.slice(iv.start, iv.end)}
      </mark>,
    );
    cursor = iv.end;
  });
  if (cursor < text.length) nodes.push(<span key="tail">{text.slice(cursor)}</span>);
  return nodes;
}

function markClass(verdict: string, isActive: boolean): string {
  const base = isGood(verdict)
    ? "bg-green-100 text-green-900"
    : "bg-rose-100 text-rose-900";
  return base + (isActive ? (isGood(verdict) ? " ring-2 ring-green-400" : " ring-2 ring-rose-400") : "");
}

function chipClass(verdict: string, isActive: boolean): string {
  const base = isGood(verdict)
    ? "bg-green-100 text-green-800"
    : "bg-rose-100 text-rose-800";
  return base + (isActive ? " ring-2 ring-gold" : "");
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[--color-border] bg-white shadow-[var(--shadow-soft)]">
      <p className="text-sm text-[--color-text-secondary]">{children}</p>
    </section>
  );
}
