"use client";

/**
 * components/AmendChat.tsx — natural-language amendments chat (FRAMEWORK ONLY).
 *
 * The senior lawyer describes tweaks ("make the opponent more aggressive");
 * the assistant acknowledges conversationally but does NOT mutate the game yet.
 * Calls /api/admin/amend; falls back to a canned reply so the UI never breaks.
 */

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SEED: Msg = {
  role: "assistant",
  content:
    "Your game is set up. Tell me anything you'd like to tweak — the opponent's style, the difficulty, which clauses are in play, the scenario framing — and I'll note it. (Amendments are acknowledged here as a placeholder; automatic application lands with document-driven generation.)",
};

const CANNED =
  "Got it — noted. That change will be applied automatically once document-driven generation is enabled (placeholder for now).";

export function AmendChat() {
  const [messages, setMessages] = useState<Msg[]>([SEED]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/amend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only user/assistant turns (skip the seeded intro for cleanliness).
        body: JSON.stringify({
          messages: next.filter((m, i) => !(i === 0 && m === SEED)),
        }),
      });
      const reply = res.ok ? (await res.json()).reply || CANNED : CANNED;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: CANNED }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[--color-border] bg-white p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-medium uppercase tracking-wide text-gold">
        Amend with natural language
      </p>

      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={
                "inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm " +
                (m.role === "user"
                  ? "bg-ink text-white"
                  : "bg-[--color-surface-soft] text-[--color-text-primary]")
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        {busy && (
          <p className="text-left text-xs text-[--color-text-muted]">
            Assistant is typing…
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. make the opponent more aggressive…"
          className="flex-1 rounded-lg border border-[--color-border-strong] px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
