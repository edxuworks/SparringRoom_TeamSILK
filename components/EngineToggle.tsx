"use client";

/**
 * components/EngineToggle.tsx — Cloud vs Local (sovereignty) switch.
 *
 * Not a model picker — a product framing:
 *   Cloud = Claude (fast, prompt-cached). Local = NVIDIA Nemotron (sovereign,
 *   slower). An (i) popover explains the trade-off. Default Cloud.
 */

import { useState } from "react";
import { Cloud, ShieldCheck, Info } from "lucide-react";
import type { EngineMode } from "@/lib/llm";

export function EngineToggle({
  mode,
  setMode,
  disabled,
}: {
  mode: EngineMode;
  setMode: (m: EngineMode) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isLocal = mode === "local";

  return (
    <div className="relative inline-flex items-center gap-2">
      <div className="inline-flex rounded-lg border border-[--color-border] p-0.5 text-sm">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("cloud")}
          className={
            "flex items-center gap-1.5 rounded-md px-3 py-1 transition disabled:opacity-50 " +
            (!isLocal
              ? "bg-ink text-white"
              : "text-[--color-text-secondary] hover:text-[--color-text-primary]")
          }
        >
          <Cloud className="h-4 w-4" strokeWidth={1.5} /> Cloud
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode("local")}
          className={
            "flex items-center gap-1.5 rounded-md px-3 py-1 transition disabled:opacity-50 " +
            (isLocal
              ? "bg-gold text-black"
              : "text-[--color-text-secondary] hover:text-[--color-text-primary]")
          }
        >
          <ShieldCheck className="h-4 w-4" strokeWidth={1.5} /> Local
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="About Cloud vs Local"
        className="text-[--color-text-muted] hover:text-gold"
      >
        <Info className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-20 w-80 rounded-xl border border-[--color-border] bg-white p-4 text-sm shadow-[var(--shadow-card)]">
          <p className="font-medium">
            <Cloud className="mr-1 inline h-4 w-4 align-text-bottom text-[--color-text-secondary]" />
            Cloud
          </p>
          <p className="mt-1 text-[--color-text-secondary]">
            Fastest responses, routed to the cloud. Best for general practice —
            not the most sensitive client data.
          </p>
          <p className="mt-3 font-medium">
            <ShieldCheck className="mr-1 inline h-4 w-4 align-text-bottom text-gold" />
            Local — sovereign mode
          </p>
          <p className="mt-1 text-[--color-text-secondary]">
            Runs on an NVIDIA Nemotron model so your data stays in your
            environment. Slower. (Demo: served via OpenRouter; in production this
            is your firm&apos;s on-prem GPU.)
          </p>
        </div>
      )}
    </div>
  );
}
