/**
 * lib/setup.ts — the per-round selections (SessionSetup) + hot-seat prompt assembly.
 *
 * SessionSetup is chosen in the junior-flow wizard (case → opponent → clauses)
 * and flows into the round: voice via ElevenLabs `customLlmExtraBody`
 * (-> `elevenlabs_extra_body` on the shim request), typed via the /api/adversary
 * body. Both the shim and the typed route build the Technician's prompt here.
 *
 * The prompt is split for prompt-caching: a large STATIC rulebook block (skill +
 * checklist + firm playbook, identical every turn) and a small VOLATILE
 * instruction block (case + persona + difficulty + chosen clauses + state).
 */

import type { Case } from "../data/case";
import { getCase, DEFAULT_CASE_ID } from "../data/cases";
import { getPersona, DEFAULT_PERSONA_ID } from "../data/personas";
import { getDifficulty, DEFAULT_DIFFICULTY_ID } from "../data/difficulties";
import { RULEBOOK } from "./skill";
import type { EngineMode } from "./llm";
import { hotSeatInstructions, type GameStateSummary } from "../prompts/hotseat";

export interface SessionSetup {
  caseId: string;
  personaId: string;
  difficultyId: string;
  clauseIds: string[];
  /** Cloud (Claude, default) vs Local (Nemotron / sovereign). */
  engineMode: EngineMode;
}

export const DEFAULT_SETUP: SessionSetup = {
  caseId: DEFAULT_CASE_ID,
  personaId: DEFAULT_PERSONA_ID,
  difficultyId: DEFAULT_DIFFICULTY_ID,
  clauseIds: [],
  engineMode: "cloud",
};

/** Merge partial selections (from the client) over the defaults. */
export function resolveSetup(partial?: Partial<SessionSetup>): SessionSetup {
  return {
    caseId: partial?.caseId || DEFAULT_SETUP.caseId,
    personaId: partial?.personaId || DEFAULT_SETUP.personaId,
    difficultyId: partial?.difficultyId || DEFAULT_SETUP.difficultyId,
    clauseIds: partial?.clauseIds ?? DEFAULT_SETUP.clauseIds,
    engineMode: partial?.engineMode || DEFAULT_SETUP.engineMode,
  };
}

/**
 * Build the Technician's system prompt for a round.
 * Returns the cacheable `rulebook` block and the volatile `instructions` block
 * separately so lib/llm.ts can prompt-cache the rulebook prefix.
 */
export async function buildHotSeatSystem(
  setup: SessionSetup,
  state: GameStateSummary,
): Promise<{ rulebook: string; instructions: string; caseData: Case }> {
  const caseData = getCase(setup.caseId);
  const persona = getPersona(setup.personaId);
  const difficulty = getDifficulty(setup.difficultyId);
  const focusClauses = caseData.clauses.filter((c) =>
    setup.clauseIds.includes(c.id),
  );

  const instructions = hotSeatInstructions(caseData, state, {
    personaModifier: persona.systemPromptModifier,
    difficultyModifier: difficulty.modifier,
    focusClauses,
  });

  return { rulebook: RULEBOOK, instructions, caseData };
}
