"use client";

/**
 * app/page.tsx — The Sparring Room (single-page call screen + debrief card).
 *
 * Two views: the negotiation call and the scored debrief. Two modes:
 *  - Voice (ElevenLabs): the real vertical slice.
 *  - Typed fallback: drives the same adversary + debrief without voice minutes,
 *    so the brain is always demoable even if voice is flaky.
 */

import { useCallback, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { CASE } from "@/data/case";
import type { CoachResult } from "@/prompts/coach";

type Turn = { role: "user" | "adversary"; text: string };
type View = "call" | "debrief";
type Mode = "voice" | "text";

const TEXT_OPENER =
  "Shall we start with the liability cap? My client won't accept your 12-month figure — given our GDPR exposure we need uncapped liability on data-protection breaches.";

function SparringRoom() {
  const [view, setView] = useState<View>("call");
  const [mode, setMode] = useState<Mode>("voice");
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [debrief, setDebrief] = useState<CoachResult | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const transcriptRef = useRef<Turn[]>([]);

  const pushTurn = useCallback((t: Turn) => {
    transcriptRef.current = [...transcriptRef.current, t];
    setTranscript(transcriptRef.current);
  }, []);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onDisconnect: () => setStarted(false),
    onError: (msg: string) => setError(msg),
    onMessage: (m: { message?: string; source: "user" | "ai" }) => {
      const text = m.message?.trim();
      if (!text) return;
      pushTurn({ role: m.source === "ai" ? "adversary" : "user", text });
    },
  });

  // --- Voice ---
  const startVoice = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch("/api/elevenlabs/signed-url");
      if (!res.ok) throw new Error((await res.json()).error || "signed-url failed");
      const { signedUrl } = await res.json();
      await conversation.startSession({ signedUrl });
      setStarted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setConnecting(false);
    }
  }, [conversation]);

  // --- Typed fallback ---
  const startText = useCallback(() => {
    setError(null);
    transcriptRef.current = [{ role: "adversary", text: TEXT_OPENER }];
    setTranscript(transcriptRef.current);
    setStarted(true);
  }, []);

  const sendText = useCallback(async () => {
    const line = textInput.trim();
    if (!line || thinking) return;
    setTextInput("");
    pushTurn({ role: "user", text: line });
    setThinking(true);
    try {
      const messages = transcriptRef.current.map((t) => ({
        role: (t.role === "adversary" ? "assistant" : "user") as
          | "assistant"
          | "user",
        content: t.text,
      }));
      const res = await fetch("/api/adversary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "adversary failed");
      const { reply } = await res.json();
      pushTurn({ role: "adversary", text: reply });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setThinking(false);
    }
  }, [textInput, thinking, pushTurn]);

  // --- End round -> coach ---
  const endRound = useCallback(async () => {
    if (mode === "voice") {
      try {
        conversation.endSession();
      } catch {
        /* ignore */
      }
    }
    setStarted(false);
    if (transcriptRef.current.length === 0) {
      setError("Nothing to score yet.");
      return;
    }
    setScoring(true);
    setView("debrief");
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: { turns: transcriptRef.current } }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "coach failed");
      setDebrief((await res.json()) as CoachResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setScoring(false);
    }
  }, [mode, conversation]);

  const goAgain = useCallback(() => {
    transcriptRef.current = [];
    setTranscript([]);
    setDebrief(null);
    setError(null);
    setView("call");
    setStarted(false);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">The Sparring Room</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Practise under pressure against an AI that fights back.
        </p>
      </header>

      {/* Case banner */}
      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
        <p className="font-medium">
          You act for {CASE.userParty.name} (the {CASE.userParty.role}).
        </p>
        <p className="mt-1 text-neutral-600">{CASE.issue}</p>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {view === "call" ? (
        <CallView
          mode={mode}
          setMode={setMode}
          started={started}
          connecting={connecting}
          conversation={conversation}
          transcript={transcript}
          thinking={thinking}
          textInput={textInput}
          setTextInput={setTextInput}
          onStartVoice={startVoice}
          onStartText={startText}
          onSendText={sendText}
          onEndRound={endRound}
        />
      ) : (
        <DebriefView debrief={debrief} scoring={scoring} onGoAgain={goAgain} />
      )}
    </main>
  );
}

function CallView(props: {
  mode: Mode;
  setMode: (m: Mode) => void;
  started: boolean;
  connecting: boolean;
  conversation: ReturnType<typeof useConversation>;
  transcript: Turn[];
  thinking: boolean;
  textInput: string;
  setTextInput: (s: string) => void;
  onStartVoice: () => void;
  onStartText: () => void;
  onSendText: () => void;
  onEndRound: () => void;
}) {
  const {
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
  } = props;

  const status =
    mode === "voice"
      ? conversation.isSpeaking
        ? "AI speaking…"
        : conversation.status === "connected"
          ? "Listening…"
          : conversation.status
      : thinking
        ? "AI thinking…"
        : "Your move";

  return (
    <section className="flex flex-col gap-4">
      {!started && (
        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          {started ? status : "Ready"}
        </span>
        {!started ? (
          mode === "voice" ? (
            <button
              onClick={onStartVoice}
              disabled={connecting}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Start Round (voice)"}
            </button>
          ) : (
            <button
              onClick={onStartText}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              Start Round (typed)
            </button>
          )
        ) : (
          <button
            onClick={onEndRound}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            End Round
          </button>
        )}
      </div>

      {/* Transcript */}
      <div className="flex min-h-[280px] flex-col gap-3 rounded-xl border border-neutral-200 p-4">
        {transcript.length === 0 ? (
          <p className="m-auto text-sm text-neutral-400">
            {mode === "voice"
              ? "Grant your mic and start the round. Opposing counsel will open."
              : "Start the round and type your first move."}
          </p>
        ) : (
          transcript.map((t, i) => (
            <div
              key={i}
              className={t.role === "user" ? "text-right" : "text-left"}
            >
              <span className="mb-0.5 block text-xs text-neutral-400">
                {t.role === "user" ? "You" : "Opposing counsel"}
              </span>
              <span
                className={
                  "inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm " +
                  (t.role === "user"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-900")
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
            placeholder="Your negotiation turn…"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={thinking}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
    <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 text-sm">
      {(["voice", "text"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={
            "rounded-md px-3 py-1 " +
            (mode === m ? "bg-neutral-900 text-white" : "text-neutral-600")
          }
        >
          {m === "voice" ? "Voice" : "Typed"}
        </button>
      ))}
    </div>
  );
}

function DebriefView({
  debrief,
  scoring,
  onGoAgain,
}: {
  debrief: CoachResult | null;
  scoring: boolean;
  onGoAgain: () => void;
}) {
  if (scoring || !debrief) {
    return (
      <section className="flex min-h-[280px] items-center justify-center rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-500">Scoring your round…</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-neutral-200 p-6">
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-semibold tabular-nums">{debrief.score}</span>
        <span className="text-sm text-neutral-500">/ 100</span>
        {!debrief.batnaHeld && (
          <span className="ml-auto rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            Reservation point crossed
          </span>
        )}
      </div>

      <p className="text-base">{debrief.verdict}</p>

      <div className="flex flex-wrap gap-2">
        {debrief.tags.map((tag, i) => {
          const strong = tag.toLowerCase().startsWith("strong");
          return (
            <span
              key={i}
              className={
                "rounded-full px-3 py-1 text-xs font-medium " +
                (strong
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800")
              }
            >
              {tag}
            </span>
          );
        })}
      </div>

      <div className="rounded-lg bg-neutral-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Turning point — turn {debrief.turningPoint.turn}
        </p>
        <p className="mt-1 text-sm">{debrief.turningPoint.what}</p>
        <p className="mt-2 text-sm text-neutral-600">
          <span className="font-medium text-neutral-900">A stronger move: </span>
          {debrief.turningPoint.betterMove}
        </p>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-neutral-500">
          Per-dimension breakdown
        </summary>
        <ul className="mt-2 space-y-2">
          {debrief.dimensions.map((d, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-10 shrink-0 tabular-nums text-neutral-400">
                {d.score}/5
              </span>
              <span>
                <span className="font-medium">{d.name}.</span>
                {d.comment ? (
                  <span className="text-neutral-600"> {d.comment}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </details>

      <button
        onClick={onGoAgain}
        className="self-start rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Go Again
      </button>
    </section>
  );
}

export default function Page() {
  return (
    <ConversationProvider>
      <SparringRoom />
    </ConversationProvider>
  );
}
