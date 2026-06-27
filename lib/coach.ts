/**
 * lib/coach.ts — end-of-round DEBRIEF (shared by /api/coach and the harness).
 *
 * Grounded in the firm RULEBOOK (skill debrief format + playbook gold standard +
 * consequence framework), injected as a CACHED system block. We use CONSTRAINED
 * decoding (Anthropic structured outputs on the Cloud path) so the reply is
 * guaranteed schema-valid in ONE pass — no parse-then-retry latency tax, no
 * intermittent 500s. zod stays as a final type guard. thinking off + effort low.
 *
 * SWAP point: natural home for an independent NVIDIA Nemotron judge later.
 */

import { z } from "zod";
import {
  generateStructured,
  generateStructuredWithTools,
  type BrainId,
  type ToolDef,
} from "./llm";
import { lookupAuthority, formatAuthorityForModel } from "./research";
import { RULEBOOK } from "./skill";
import { getCase } from "../data/cases";
import {
  coachInstructions,
  type CoachResult,
  type Transcript,
} from "../prompts/coach";
import { resolveSetup, type SessionSetup } from "./setup";

// Lean shape (mirrors prompts/coach.ts CoachResult) — small output = fast debrief.
const CoachSchema = z.object({
  headline: z.string(),
  score: z.number(),
  gaps: z.array(z.object({ issue: z.string(), correct: z.string() })),
  trapsPicked: z.array(z.string()),
  learningPoints: z.array(z.string()),
});

/** JSON schema the model is constrained to (built once; objects are all-required + closed). */
const COACH_JSON_SCHEMA = (() => {
  const schema = z.toJSONSchema(CoachSchema) as Record<string, unknown>;
  delete schema.$schema; // meta-annotation; not part of the output contract
  return schema;
})();

/** Score a round and return the structured debrief. Throws once if the model can't be validated. */
export async function scoreRound(
  transcript: Transcript,
  setupOrCaseId?: Partial<SessionSetup> | string,
  brain: BrainId = "claude",
): Promise<CoachResult> {
  const setup = resolveSetup(
    typeof setupOrCaseId === "string"
      ? { caseId: setupOrCaseId }
      : setupOrCaseId,
  );
  const caseData = getCase(setup.caseId);
  const chosenClauses = caseData.clauses.filter((c) =>
    setup.clauseIds.includes(c.id),
  );
  const instructions = coachInstructions(caseData, transcript, chosenClauses);

  // One constrained pass: the model is forced to the schema, so the reply parses
  // and validates first time. zod is the final type guard, not a retry trigger.
  const text = await generateStructured({
    brain,
    role: "coach",
    rulebook: RULEBOOK,
    instructions,
    maxTokens: 700,
    jsonSchema: COACH_JSON_SCHEMA,
    messages: [
      {
        role: "user",
        content:
          "Produce the debrief now as a single JSON object in the exact required shape.",
      },
    ],
  });

  // Defensive on the Nemotron path (no constrained decoding): slice to the object.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Coach returned no JSON object.");
  }
  return CoachSchema.parse(JSON.parse(text.slice(start, end + 1))) as CoachResult;
}
