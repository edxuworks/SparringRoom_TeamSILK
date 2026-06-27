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

/**
 * Shape the coach must return — kept LEAN so the debrief generates near-instantly.
 * (Heavier sections — 4-part consequence framework, "got right", faulty
 * assumptions, "before you go back" — were trimmed for latency; re-add fields here
 * + in CoachSchema + DebriefView to restore them.)
 */
export interface CoachResult {
  /** One-sentence overall assessment (legal AND commercial). */
  headline: string;
  /** 0-100 "health" score after gaps and trap penalties. */
  score: number;
  /** Top issues missed: what was missed + the gold-standard fix. */
  gaps: { issue: string; correct: string }[];
  /** Trap clauses the junior picked/defended (penalised). */
  trapsPicked: string[];
  learningPoints: string[];
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
${transcriptText}

OUTPUT
Return a single JSON object in EXACTLY this shape and NOTHING ELSE. This renders on
a card and must generate FAST, so keep it tiny:
- "gaps": at most 2 — the two most important only. Each "issue" and "correct" is
  ONE short phrase (max ~12 words). Cite only the bare article number.
- "trapsPicked": the trap clause(s) they defended, else [].
- "learningPoints": at most 3, each a short phrase (max ~12 words).
- "headline": one short sentence.
Do not pad. Do not add fields.
{
  "headline": "<one short sentence, legal + commercial>",
  "score": <0-100 integer>,
  "gaps": [ { "issue": "<missed, short>", "correct": "<gold-standard fix, short>" } ],
  "trapsPicked": ["<trap clause defended, or empty>"],
  "learningPoints": ["<short>", "<short>"]
}
`.trim();
}
