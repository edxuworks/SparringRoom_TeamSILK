"use client";

/**
 * components/CallView.tsx — the live round (step 4).
 *
 * Voice (ElevenLabs) or typed fallback. In voice mode it shows the live
 * VoiceVisualizer so the user can see their voice is being heard. Presentational:
 * all session logic lives in the orchestrator (app/page.tsx).
 */

import type { useConversation } from "@elevenlabs/react";
import type { Mode, Turn } from "./types";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { MicOrb } from "./MicOrb";

type Conversation = ReturnType<typeof useConversation>;

export function CallView({
  mode,
  setMode,
  started,
  connecting,
  conversation,
  transcript,
  thinking,
  textInput,
  setTextInput,
  onStartVoice,
  onStartText,
  onSendText,
  onEndRound,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  started: boolean;
  connecting: boolean;
  conversation: Conversation;
  transcript: Turn[];
  thinking: boolean;
  textInput: string;
  setTextInput: (s: string) => void;
  onStartVoice: () => void;
  onStartText: () => void;
  onSendText: () => void;
  onEndRound: () => void;
}) {
  const status =
    mode === "voice"
      ? conversation.isSpeaking
        ? "The Technician is speaking…"
        : conversation.status === "connected"
          ? "Listening…"
          : conversation.status
      : thinking
        ? "The Technician is thinking…"
        : "Your move";

  return (
    <section className="flex flex-col gap-4">
      {!started && (
        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-[--color-text-secondary]">
          {started ? status : "Ready to defend"}
        </span>
        {!started ? (
          mode === "voice" ? (
            <button
              onClick={onStartVoice}
              disabled={connecting}
              className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Start Round (voice)"}
            </button>
          ) : (
            <button
              onClick={onStartText}
              className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover"
            >
              Start Round (typed)
            </button>
          )
        ) : (
          <button
            onClick={onEndRound}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            End Round
          </button>
        )}
      </div>

      {/* Voice centerpiece: mic orb + live visualizer (voice mode only) */}
      {mode === "voice" && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-[--color-border] bg-white px-4 py-6 shadow-[var(--shadow-soft)]">
          <MicOrb
            conversation={conversation}
            active={started}
            speaking={conversation.isSpeaking}
          />
          <VoiceVisualizer conversation={conversation} active={started} />
        </div>
      )}

      {/* Transcript */}
      <div className="flex min-h-[240px] flex-col gap-3 rounded-2xl border border-[--color-border] bg-white p-4 shadow-[var(--shadow-soft)]">
        {transcript.length === 0 ? (
          <p className="m-auto text-sm text-[--color-text-muted]">
            {mode === "voice"
              ? "Grant your mic and start the round. The Technician will open."
              : "Start the round and answer the Technician."}
          </p>
        ) : (
          transcript.map((t, i) => (
            <div key={i} className={t.role === "user" ? "text-right" : "text-left"}>
              <span className="mb-0.5 block text-xs text-[--color-text-muted]">
                {t.role === "user" ? "You" : "The Technician"}
              </span>
              <span
                className={
                  "inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm " +
                  (t.role === "user"
                    ? "bg-ink text-white"
                    : "bg-[--color-surface-soft] text-[--color-text-primary]")
                }
              >
                {t.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Typed input */}
      {started && mode === "text" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendText();
          }}
          className="flex gap-2"
        >
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Your answer to the Technician…"
            className="flex-1 rounded-lg border border-[--color-border-strong] px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <button
            type="submit"
            disabled={thinking}
            className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-hover disabled:opacity-50"
          >
            Send
          </button>
        </form>
      )}
    </section>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-[--color-border] p-0.5 text-sm">
      {(["voice", "text"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={
            "rounded-md px-3 py-1 transition " +
            (mode === m
              ? "bg-ink text-white"
              : "text-[--color-text-secondary] hover:text-[--color-text-primary]")
          }
        >
          {m === "voice" ? "Voice" : "Typed"}
        </button>
      ))}
    </div>
  );
}
