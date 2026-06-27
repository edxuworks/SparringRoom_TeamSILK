"use client";

/**
 * app/page.tsx — The Sparring Room, junior-lawyer flow.
 *
 * A step wizard (wireframe): user type → case → opponent → context+clauses →
 * voice round → feedback report. Everything runs under one ConversationProvider
 * so the ElevenLabs session stays mounted across steps. Per-round selections
 * (SessionSetup) flow into the round: voice via customLlmExtraBody, typed via the
 * /api/adversary body, and into /api/coach via caseId.
 *
 * All domain content (case, personas, difficulty, clauses, feedback) is
 * PLACEHOLDER — lawyer-authored versions swap in behind the same seams.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import type { CoachResult } from "@/prompts/coach";
import { CASES, getCase } from "@/data/cases";
import { getPersona, DEFAULT_PERSONA_ID } from "@/data/personas";
import { getDifficulty, DEFAULT_DIFFICULTY_ID } from "@/data/difficulties";
import type { SessionSetup } from "@/lib/setup";
import type { Turn, Mode } from "@/components/types";
import { GreekHallBackground } from "@/components/GreekHallBackground";
import { UserTypeScreen } from "@/components/UserTypeScreen";
import { AdminUpload } from "@/components/AdminUpload";
import { AdminDone } from "@/components/AdminDone";
import { CaseSelect } from "@/components/CaseSelect";
import { OpponentSelect } from "@/components/OpponentSelect";
import { ContextClauses } from "@/components/ContextClauses";
import { CallView } from "@/components/CallView";
import { DebriefView } from "@/components/DebriefView";
import { EngineToggle } from "@/components/EngineToggle";

type Step =
  | "userType"
  | "adminUpload"
  | "adminDone"
  | "caseSelect"
  | "opponent"
  | "clauses"
  | "round"
  | "report";

const TEXT_OPENER =
  "Before we start — what's your headline read on this DPA from a data-protection perspective? Biggest risk, what it means for the Trust commercially, and your recommended position. Sixty seconds.";

function SparringRoom() {
  const [step, setStep] = useState<Step>("userType");
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [setup, setSetup] = useState<SessionSetup>({
    caseId: CASES[0].id,
    personaId: DEFAULT_PERSONA_ID,
    difficultyId: DEFAULT_DIFFICULTY_ID,
    clauseIds: [],
    engineMode: "cloud",
  });

  // --- round state ---
  const [mode, setMode] = useState<Mode>("voice");
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [debrief, setDebrief] = useState<CoachResult | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const transcriptRef = useRef<Turn[]>([]);

  const caseData = getCase(setup.caseId);

  // Local / Sovereign mode → dark theme. Toggle on <html> so the token overrides
  // cascade across the whole document.
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("engine-dark", setup.engineMode === "local");
    return () => el.classList.remove("engine-dark");
  }, [setup.engineMode]);

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

  // --- voice ---
  const startVoice = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch("/api/elevenlabs/signed-url");
      if (!res.ok) throw new Error((await res.json()).error || "signed-url failed");
      const { signedUrl } = await res.json();
      // The chosen clauses fill the baked agent's {{focus_clauses}} placeholder
      // (Option 1, Qwen). customLlmExtraBody still carries the full setup for the
      // shim path (Option 2, when re-pointed to custom LLM).
      const chosen = caseData.clauses.filter((c) =>
        setup.clauseIds.includes(c.id),
      );
      const focus_clauses = chosen.length
        ? chosen.map((c) => `- ${c.label}`).join("\n")
        : "No specific clauses chosen — test their overall analysis.";
      await conversation.startSession({
        signedUrl,
        dynamicVariables: { focus_clauses },
        customLlmExtraBody: setup,
      });
      setStarted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setConnecting(false);
    }
  }, [conversation, setup, caseData]);

  // --- typed fallback ---
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
        body: JSON.stringify({ messages, setup }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "adversary failed");
      const data = await res.json();
      if (data.fellBack) setError("Local model unavailable — answered on Cloud.");
      pushTurn({ role: "adversary", text: data.reply });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setThinking(false);
    }
  }, [textInput, thinking, pushTurn, setup]);

  // --- scoring (shared by end-of-round and the debrief "Try again" button) ---
  const runScoring = useCallback(async () => {
    if (transcriptRef.current.length === 0) {
      setError("Nothing to score yet.");
      return;
    }
    setCoachError(null);
    setScoring(true);
    // Fail fast: never let the spinner hang on a slow/stuck request.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: { turns: transcriptRef.current },
          setup,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error((await res.json()).error || "coach failed");
      const data = await res.json();
      if (data.fellBack) setError("Local model unavailable — scored on Cloud.");
      setDebrief(data as CoachResult);
    } catch (e) {
      setCoachError(
        controller.signal.aborted
          ? "Scoring timed out. Try again."
          : e instanceof Error
            ? e.message
            : String(e),
      );
    } finally {
      clearTimeout(timer);
      setScoring(false);
    }
  }, [setup]);

  // --- end round -> coach -> report ---
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
    setStep("report");
    void runScoring();
  }, [mode, conversation, runScoring]);

  const resetRound = useCallback(() => {
    transcriptRef.current = [];
    setTranscript([]);
    setDebrief(null);
    setError(null);
    setCoachError(null);
    setStarted(false);
    setTextInput("");
  }, []);

  const goAgain = useCallback(() => {
    resetRound();
    setStep("caseSelect");
  }, [resetRound]);

  const toggleClause = useCallback((id: string) => {
    setSetup((s) => ({
      ...s,
      clauseIds: s.clauseIds.includes(id)
        ? s.clauseIds.filter((x) => x !== id)
        : [...s.clauseIds, id],
    }));
  }, []);

  const isLanding = step === "userType";

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white text-[--color-text-primary] transition-colors duration-300">
      <GreekHallBackground faded={!isLanding} dark={setup.engineMode === "local"} />

      <div
        className={
          "relative z-10 mx-auto flex min-h-screen w-full flex-1 flex-col px-6 py-10 transition-[max-width] duration-300 " +
          // Widen the clauses step so the case-context / clauses split has room.
          (step === "clauses" ? "max-w-5xl" : "max-w-3xl")
        }
      >
        {!isLanding && (
          <header className="mb-6 flex items-center justify-between gap-3 border-b border-gold/30 pb-3">
            <span className="font-heading text-xl font-semibold tracking-tight">
              The Sparring Room
            </span>
            <EngineToggle
              mode={setup.engineMode}
              setMode={(m) => setSetup((s) => ({ ...s, engineMode: m }))}
              disabled={started}
            />
          </header>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {isLanding ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <UserTypeScreen
              onJunior={() => setStep("caseSelect")}
              onAdmin={() => setStep("adminUpload")}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">

      {step === "adminUpload" && (
        <AdminUpload
          onBack={() => setStep("userType")}
          onGenerated={(name) => {
            setUploadedName(name);
            setStep("adminDone");
          }}
        />
      )}

      {step === "adminDone" && (
        <AdminDone
          filename={uploadedName}
          engineMode={setup.engineMode}
          onTest={() => {
            resetRound();
            setStep("caseSelect");
          }}
          onReupload={() => setStep("adminUpload")}
        />
      )}

      {step === "caseSelect" && (
        <CaseSelect
          cases={CASES}
          selectedId={setup.caseId}
          onSelect={(id) => setSetup((s) => ({ ...s, caseId: id }))}
          onNext={() => setStep("opponent")}
          onBack={() => setStep("userType")}
        />
      )}

      {step === "opponent" && (
        <OpponentSelect
          personaId={setup.personaId}
          difficultyId={setup.difficultyId}
          onPersona={(id) => setSetup((s) => ({ ...s, personaId: id }))}
          onDifficulty={(id) => setSetup((s) => ({ ...s, difficultyId: id }))}
          onNext={() => setStep("clauses")}
          onBack={() => setStep("caseSelect")}
        />
      )}

      {step === "clauses" && (
        <ContextClauses
          caseData={caseData}
          clauseIds={setup.clauseIds}
          onToggleClause={toggleClause}
          onNext={() => setStep("round")}
          onBack={() => setStep("opponent")}
        />
      )}

      {step === "round" && (
        <>
          {/* Compact context banner for the chosen setup */}
          <section className="rounded-2xl border border-[--color-border] bg-[--color-surface-soft] p-4 text-sm shadow-[var(--shadow-soft)]">
            <p className="font-medium">
              {caseData.title} — you act for {caseData.userParty.name}
            </p>
            <p className="mt-1 text-[--color-text-secondary]">
              The Technician · {getPersona(setup.personaId).label} ·{" "}
              {getDifficulty(setup.difficultyId).label}
            </p>
          </section>

          {!started && (
            <button
              onClick={() => {
                resetRound();
                setStep("clauses");
              }}
              className="self-start rounded-lg border border-[--color-border-strong] px-4 py-2 text-sm font-medium hover:bg-[--color-surface-soft]"
            >
              ← Back
            </button>
          )}

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
        </>
      )}

      {step === "report" && (
        <DebriefView
          debrief={debrief}
          scoring={scoring}
          error={coachError}
          onRetry={runScoring}
          onGoAgain={goAgain}
        />
      )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <ConversationProvider>
      <SparringRoom />
    </ConversationProvider>
  );
}
