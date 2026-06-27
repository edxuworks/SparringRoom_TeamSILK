/**
 * prompts/coach.ts — the Phase-4 DEBRIEF (the only phase where the AI gives answers).
 *
 * Grounded in the firm RULEBOOK (injected by lib/coach.ts as a cached system
 * block): the SKILL's debrief format, the playbook's Gold Standard Answers, the
 * Consequence Framework, and the trap-clause analysis. This file produces only
 * the volatile instruction block (case + chosen clauses + transcript + JSON shape).
 */

import type { Case, Clause } from "../data/case";

export interface Transcript {
  turns: { role: "user" | "adversary"; text: string }[];
}

/** A single coaching note anchored to a passage of the transcript. */
export interface CoachAnnotation {
  /** Index into transcript.turns that this note marks. */
  turn: number;
  /** VERBATIM substring copied from that turn — drives the inline highlight. */
  quote: string;
  /** Was this passage strong or weak? */
  verdict: "good" | "bad";
  /** Short tag, e.g. "Missed Art 28(3)". */
  label: string;
  /** 1-2 sentences: why it was good/bad + the fix (rulebook-grounded). */
  comment: string;
}

/**
 * Shape the coach must return — an annotated transcript: a top-level performance
 * summary plus notes anchored to specific passages of the round.
 */
export interface CoachResult {
  /** One-sentence overall assessment (legal AND commercial). */
  headline: string;
  /** 0-100 "health" score after gaps and trap penalties. */
  score: number;
  /** 2-4 key performance bullets / indicators for the summary header. */
  summary: string[];
  /** Notes anchored to transcript passages, ordered by turn. */
  annotations: CoachAnnotation[];
  /** Trap clauses the junior picked/defended (penalised) — drives the badge. */
  trapsPicked: string[];
}

export function coachInstructions(
  caseData: Case,
  transcript: Transcript,
  chosenClauses: Clause[] = [],
): string {
  const transcriptText = transcript.turns
    .map(
      (t, i) =>
        `[${i}] ${t.role === "user" ? "JUNIOR" : "TECHNICIAN"}: ${t.text}`,
    )
    .join("\n");

  const chosen = chosenClauses.length
    ? chosenClauses
        .map((c) => `- ${c.label}${c.isTrap ? "  [TRAP]" : ""}`)
        .join("\n")
    : "- (none specified)";

  return `
You are an elite partner delivering the Phase-4 DEBRIEF from the SKILL, grounded in
the FIRM RULEBOOK above. This is the ONLY phase where you give answers. Grade the
junior's reasoning against the rulebook's GOLD STANDARD ANSWERS and the CONSEQUENCE
FRAMEWORK; surface gaps and faulty assumptions; penalise any TRAP clause they
defended.

THE MATTER
${caseData.issue}
The junior acted for ${caseData.userParty.name} (the ${caseData.userParty.role}).

CLAUSES THEY CHOSE TO DEFEND
${chosen}

HOW TO SCORE
- "score" is 0-100 health. Start high if they met the gold standard across their
  chosen clauses AND held the pushback defences; reduce for each gap and especially
  any TRAP clause they picked/defended.
- Ground every judgement in the rulebook — no vibes, never invent law.

TRANSCRIPT
Each turn is numbered [i]. Use that number as "turn" in your annotations.
${transcriptText}

OUTPUT
Return a single JSON object in EXACTLY this shape and NOTHING ELSE. Be TERSE — this
must generate in 2-3 seconds, so keep it tight:
- "summary": exactly 2 bullets — the headline indicators (max ~10 words each).
- "annotations": EXACTLY 2 notes — the two single most important passages — ORDERED by "turn":
  - "turn": the [i] index of the turn the note is about (mostly the JUNIOR's
    answers; you may also mark a sharp TECHNICIAN question).
  - "quote": an EXACT VERBATIM substring copied character-for-character from that
    turn's text (a short phrase, ~4-10 words). This is highlighted in the UI, so it
    MUST appear verbatim in the turn — do not paraphrase, reword, or add ellipses.
  - "verdict": "good" or "bad".
  - "label": a short tag (max ~5 words), e.g. "Missed Art 28(3)".
  - "comment": ONE short clause, MAX 10 WORDS — why / the fix. NO lettered lists
    like "28(3)(d),(f),(g)", NO multi-article citations — at most one bare article
    number. Example: "Confidentiality alone misses Art 28(3) sub-processor controls."
- "trapsPicked": the trap clause(s) they defended, else [].
- "headline": one short sentence (max ~14 words).
Do not invent quotes. Do not pad. Do not add fields.
{
  "headline": "<one short sentence>",
  "score": <0-100 integer>,
  "summary": ["<short indicator>", "<short indicator>"],
  "annotations": [
    { "turn": <i>, "quote": "<verbatim phrase from turn i>", "verdict": "good|bad", "label": "<short tag>", "comment": "<1-2 sentences, rulebook-grounded>" }
  ],
  "trapsPicked": ["<trap clause defended, or empty>"]
}
`.trim();
}
