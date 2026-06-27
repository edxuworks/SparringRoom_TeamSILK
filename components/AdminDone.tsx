"use client";

/**
 * components/AdminDone.tsx — admin B2: "game ready" + test + amendments chat.
 *
 * The "generated" game is the placeholder case (data/cases.ts) — shown as a
 * believable summary so the Wizard-of-Oz reads as real. Test plays the junior
 * side; the chat (AmendChat) acknowledges tweaks without mutating anything yet.
 */

import { CASES } from "@/data/cases";
import { PERSONAS } from "@/data/personas";
import { AmendChat } from "./AmendChat";

export function AdminDone({
  filename,
  onTest,
  onReupload,
}: {
  filename: string | null;
  onTest: () => void;
  onReupload: () => void;
}) {
  const generated = CASES[0]; // placeholder "generated" game

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-[var(--shadow-soft)]">
        <p className="font-heading text-2xl font-semibold text-green-900">
          ✓ Your game is ready
        </p>
        <p className="mt-1 text-sm text-green-800">
          {filename ? (
            <>
              We turned <span className="font-medium">{filename}</span> into a
              training game.
            </>
          ) : (
            "Your training game has been generated."
          )}
        </p>

        {/* Placeholder summary of what was "generated" */}
        <dl className="mt-4 grid gap-2 text-sm text-green-900 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-green-700/70">
              Scenario
            </dt>
            <dd className="font-medium">{generated.title}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-green-700/70">
              Opponents
            </dt>
            <dd className="font-medium">
              {PERSONAS.map((p) => p.label).join(", ")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-green-700/70">
              Clauses
            </dt>
            <dd className="font-medium">
              {generated.clauses.map((c) => c.label).join(" · ")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onTest}
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-hover"
        >
          ▶ Test it — play as a junior
        </button>
        <button
          onClick={onReupload}
          className="rounded-lg border border-[--color-border-strong] px-4 py-2 text-sm font-medium hover:bg-[--color-surface-soft]"
        >
          Upload a different document
        </button>
      </div>

      <AmendChat />

      <p className="text-xs text-[--color-text-muted]">
        Changes requested in chat are acknowledged but not yet applied — automatic
        application arrives with document-driven generation. (Placeholder.)
      </p>
    </section>
  );
}
