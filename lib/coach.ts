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
import { generateStructured, type BrainId } from "./llm";
import { RULEBOOK } from "./skill";
import { getCase } from "../data/cases";
import {
  coachInstructions,
  type CoachResult,
  type Transcript,
} from "../prompts/coach";
import { resolveSetup, type SessionSetup } from "./setup";

// Annotated-transcript shape (mirrors prompts/coach.ts CoachResult).
const CoachSchema = z.object({
  headline: z.string(),
  score: z.number(),
  summary: z.array(z.string()),
  annotations: z.array(
    z.object({
      turn: z.number(),
      quote: z.string(),
      verdict: z.enum(["good", "bad"]),
      label: z.string().describe("Short tag, max 5 words."),
      comment: z
        .string()
        .describe(
          "ONE short clause, max 10 words. No lettered sub-article lists, no citations beyond a bare article number. Terse.",
        ),
    }),
  ),
  trapsPicked: z.array(z.string()),
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
  const userMessage = {
    role: "user" as const,
    content:
      "Produce the debrief now as a single JSON object in the exact required shape.",
  };

  // Single constrained pass — no tool loop in the hot path, so the debrief is one
  // fast generation (~2-3s on Haiku). The model is forced to the schema, so the
  // reply parses and validates first time; zod is the final type guard.
  // (The EU Cellar -> Perplexity authority cascade in lib/research.ts is kept for
  // future use but no longer runs inline; it was the main latency spike.)
  const text = await generateStructured({
    brain,
    role: "coach",
    rulebook: RULEBOOK,
    instructions,
    maxTokens: 450,
    jsonSchema: COACH_JSON_SCHEMA,
    messages: [userMessage],
  });

  // Defensive on the Nemotron path (no constrained decoding): slice to the object.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Coach returned no JSON object.");
  }
  const result = CoachSchema.parse(JSON.parse(text.slice(start, end + 1))) as CoachResult;

  // Re-anchor each annotation to the turn that actually contains its verbatim
  // quote. The model copies quotes reliably but sometimes mislabels the turn
  // index (off-by-one); trust the quote, not the index, so highlights land right.
  for (const a of result.annotations) {
    const q = a.quote?.toLowerCase().trim();
    if (!q) continue;
    if (transcript.turns[a.turn]?.text.toLowerCase().includes(q)) continue;
    const found = transcript.turns.findIndex((t) =>
      t.text.toLowerCase().includes(q),
    );
    if (found !== -1) a.turn = found;
  }
  result.annotations.sort((x, y) => x.turn - y.turn);

  return result;
}
