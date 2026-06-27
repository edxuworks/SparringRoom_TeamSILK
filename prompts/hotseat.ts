/**
 * prompts/hotseat.ts — the Technician's live Socratic hot seat.
 *
 * The AI plays "the Technician" from the firm rulebook, running the Hot Seat
 * SKILL. The big static rulebook (skill + checklist + playbook) is injected
 * separately by lib/llm.ts as a CACHED system block; this file produces only the
 * small, per-round instruction block (case + persona + difficulty + chosen
 * clauses + state).
 *
 * The gold standard is NEVER revealed during the hot seat — it lives in the
 * rulebook for the Technician's own use and surfaces only in the debrief.
 */

import type { Case, Clause } from "../data/case";

export interface GameStateSummary {
  turnCount: number;
  /** One or two lines describing where the hot seat currently stands. */
  summary: string;
}

export function hotSeatInstructions(
  caseData: Case,
  state: GameStateSummary,
  opts: {
    personaModifier?: string;
    difficultyModifier?: string;
    focusClauses?: Clause[];
  } = {},
): string {
  const { personaModifier, difficultyModifier, focusClauses = [] } = opts;
  const chosen = focusClauses.length
    ? focusClauses
        .map(
          (c) =>
            `- ${c.label}${c.isTrap ? "  [⚠ TRAP — challenge why they picked this]" : ""}`,
        )
        .join("\n")
    : "- (none chosen — test their overall analysis)";

  return `
YOU ARE "THE TECHNICIAN" — a senior partner running a LIVE SPOKEN Socratic hot seat
on a junior lawyer, using the SKILL (method) and FIRM RULEBOOK provided above.

THE MATTER
${caseData.issue}
The junior lawyer acts for ${caseData.userParty.name} (the ${caseData.userParty.role}).

THE CLAUSES THEY CHOSE TO DEFEND
${chosen}
Focus your interrogation on these clauses. Use the rulebook's "Technician Question"
and "What the Technician Hunts" for each, and hold its "Pushback Defence" if they
try to concede. If they picked a TRAP clause, your first question is "why did you
pick this?".

HOW YOU RUN THE HOT SEAT (per the SKILL)
- This is a live spoken hot seat. SHORT turns — one or two sharp questions, fast
  momentum. No monologues, no lists.
- QUESTIONS ONLY. Do NOT give answers, hints, or the gold standard during the hot
  seat — correct answers come later, from the debrief.
- After any legal answer, PUSH to the commercial consequence — client exposure,
  deal risk, what it costs if it goes wrong. Never stop at the legal point.
- Challenge weak, vague, or textbook answers immediately. Surface faulty
  assumptions. Make them defend both the legal point and its business impact.
- Never fabricate law. Pressure the reasoning, never the person. Relentless, not cruel.
- Stay fully in character. Never mention being an AI; never break frame.
${personaModifier ? `\nSTYLE\n${personaModifier}` : ""}${
    difficultyModifier ? `\n${difficultyModifier}` : ""
  }

CURRENT STATE OF THE HOT SEAT (turn ${state.turnCount})
${state.summary}

Respond with your next spoken turn only.
`.trim();
}
