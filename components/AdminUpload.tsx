"use client";

/**
 * components/AdminUpload.tsx — admin B1: intro + upload + (simulated) generation.
 *
 * Wizard of Oz: the chosen file is captured client-side only — NOT uploaded,
 * stored, or parsed. "Generate game" runs a simulated build beat, then advances.
 * The real document→game pipeline drops in behind this screen later.
 */

import { useRef, useState } from "react";
import { FileText } from "lucide-react";

export function AdminUpload({
  onBack,
  onGenerated,
}: {
  onBack: () => void;
  /** Called with the chosen filename once the simulated build finishes. */
  onGenerated: (filename: string) => void;
}) {
  const [filename, setFilename] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | null | undefined) => {
    if (f) setFilename(f.name);
  };

  // Demo: the firm's gold-standard playbook is pre-baked + cached, so when it's
  // recognised we "generate" near-instantly and reliably. Other files fall back
  // to the Wizard-of-Oz simulated build.
  const recognized = !!filename && /digdeeper|playbook|gold.?standard/i.test(filename);

  const generate = () => {
    if (!filename || building) return;
    setBuilding(true);
    setTimeout(() => onGenerated(filename), recognized ? 900 : 2200);
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Set up a training game
        </h2>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          Upload your firm&apos;s playbook or a relevant case. We&apos;ll turn it
          into a voice hot seat your juniors can train against.
        </p>
      </div>

      {building ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-[--color-border] bg-white shadow-[var(--shadow-soft)]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[--color-border-strong] border-t-gold" />
          <p className="text-sm text-[--color-text-secondary]">
            {recognized ? (
              <>
                ✓ Recognised your firm playbook — preparing the hot seat from{" "}
                <span className="font-medium">{filename}</span>…
              </>
            ) : (
              <>
                Building your game from <span className="font-medium">{filename}</span>…
              </>
            )}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files?.[0]);
          }}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[--color-border-strong] bg-white/60 p-6 text-center transition hover:border-gold"
        >
          <FileText className="h-7 w-7 text-gold" strokeWidth={1.5} />
          <span className="text-sm font-medium">
            {filename ?? "Click to upload, or drag a file here"}
          </span>
          <span className="text-xs text-[--color-text-muted]">PDF, DOCX, or TXT</span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </button>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={building}
          className="rounded-lg border border-[--color-border-strong] px-4 py-2 text-sm font-medium hover:bg-[--color-surface-soft] disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={generate}
          disabled={!filename || building}
          className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover disabled:opacity-50"
        >
          {building ? "Generating…" : "Generate game →"}
        </button>
      </div>
    </section>
  );
}
