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

/** Shape the coach must return (mirrors the SKILL debrief + game scoring). */
export interface CoachResult {
  /** One-sentence overall assessment (legal AND commercial). */
  headline: string;
  /** 0-100 "health" score after gaps, faulty assumptions, and trap penalties. */
  score: number;
  /** Consequence framework — one line each (from the rulebook). */
  consequences: {
    civil: string;
    gdpr: string;
    financial: string;
    reputational: string;
  };
  gotRight: string[];
  gaps: { issue: string; legal: string; commercial: string; correct: string }[];
  faultyAssumptions: string[];
  /** Trap clauses the junior picked/defended (penalised). */
  trapsPicked: string[];
  learningPoints: string[];
  beforeYouGoBack: string[];
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
  chosen clauses AND held the pushback defences; reduce for each gap, faulty
  assumption, and especially any TRAP clause they picked/defended.
- Be specific and cite turn numbers. Ground every judgement in the rulebook —
  no vibes. Never invent law.
- For each gap: the issue missed, the legal point, the commercial consequence,
  and the correct position (from the gold standard).
- Map the overall exposure to the four consequence categories (one line each).

TRANSCRIPT
${transcriptText}

OUTPUT
Return a single JSON object in exactly this shape. This renders on a card, so be
TERSE and stay within budget:
- Every list: at most 3 items — the most important only. Empty ([]) if none.
- Every string value: ONE short sentence, max ~25 words. No sub-clauses, no
  citations longer than the article number. The headline and each consequence:
  one sentence each.
- Each "gaps" entry: keep issue/legal/commercial/correct to one short phrase each.
Quality over quantity — a tight, high-signal debrief beats an exhaustive one.
{
  "headline": "<one sentence, legal + commercial>",
  "score": <0-100 integer>,
  "consequences": { "civil": "<one line>", "gdpr": "<one line>", "financial": "<one line>", "reputational": "<one line>" },
  "gotRight": ["<short, turn-referenced>"],
  "gaps": [ { "issue": "<missed>", "legal": "<legal point>", "commercial": "<consequence>", "correct": "<gold-standard position>" } ],
  "faultyAssumptions": ["<untested premise + why it matters>"],
  "trapsPicked": ["<trap clause they defended, or empty>"],
  "learningPoints": ["<1>", "<2>", "<3>"],
  "beforeYouGoBack": ["<outstanding issue / question for the client / clause to redraft>"]
}
`.trim();
}
