/**
 * lib/coach.ts — end-of-round DEBRIEF (shared by /api/coach and the harness).
 *
 * Grounded in the firm RULEBOOK (skill debrief format + playbook gold standard +
 * consequence framework), injected as a CACHED system block. The prompt demands
 * strict JSON, so we generate free-form (no constrained-decoding latency tax) and
 * validate with zod, retrying once. thinking off + effort low keeps it snappy.
 *
 * SWAP point: natural home for an independent NVIDIA Nemotron judge later.
 */

import { z } from "zod";
import { generateBrain, type BrainId } from "./llm";
import { RULEBOOK } from "./skill";
import { getCase } from "../data/cases";
import {
  coachInstructions,
  type CoachResult,
  type Transcript,
} from "../prompts/coach";
import { resolveSetup, type SessionSetup } from "./setup";

const CoachSchema = z.object({
  headline: z.string(),
  score: z.number(),
  consequences: z.object({
    civil: z.string(),
    gdpr: z.string(),
    financial: z.string(),
    reputational: z.string(),
  }),
  gotRight: z.array(z.string()),
  gaps: z.array(
    z.object({
      issue: z.string(),
      legal: z.string(),
      commercial: z.string(),
      correct: z.string(),
    }),
  ),
  faultyAssumptions: z.array(z.string()),
  trapsPicked: z.array(z.string()),
  learningPoints: z.array(z.string()),
  beforeYouGoBack: z.array(z.string()),
});

/** Score a round and return the structured debrief. Throws if both attempts fail. */
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

  async function attempt(nudge = ""): Promise<CoachResult | null> {
    const text = await generateBrain({
      brain,
      role: "coach",
      rulebook: RULEBOOK,
      instructions,
      maxTokens: 2000,
      messages: [
        {
          role: "user",
          content:
            "Produce the debrief now as a single raw JSON object (no markdown, no code fences, no prose), in the exact required shape." +
            nudge,
        },
      ],
    });

    // Be defensive: strip stray code fences / extract the JSON object.
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;

    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      return CoachSchema.parse(parsed) as CoachResult;
    } catch {
      return null;
    }
  }

  const first = await attempt();
  if (first) return first;
  const second = await attempt(
    " Return ONLY valid JSON matching the exact required shape.",
  );
  if (second) return second;
  throw new Error("Coach failed to return a valid debrief.");
}
