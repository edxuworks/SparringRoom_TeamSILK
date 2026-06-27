/**
 * lib/coach.ts — end-of-round scoring (shared by /api/coach and the text harness).
 *
 * The coach prompt already demands strict JSON in the exact CoachResult shape, so
 * we generate free-form (NO structured-output constrained decoding) and validate
 * the parsed JSON with zod, retrying once on failure. Constrained decoding is
 * accurate but adds a heavy per-token latency tax (~2x); free-form + validate is
 * far faster for the same reliable result here. thinking off + effort low keeps
 * it snappy — scoring is against an explicit rubric, not open reasoning.
 *
 * SWAP point: this is the natural home for NVIDIA Nemotron later — a different
 * model family grading the round than the one that generated it, avoiding
 * correlated blind spots.
 */

import { z } from "zod";
import { anthropic, modelFor } from "./llm";
import { CASE } from "../data/case";
import { PLAYBOOK } from "../data/playbook";
import { RUBRIC } from "../data/rubric";
import {
  coachSystemPrompt,
  type CoachResult,
  type Transcript,
} from "../prompts/coach";

const CoachSchema = z.object({
  score: z.number(),
  batnaHeld: z.boolean(),
  dimensions: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      comment: z.string().optional(), // omitted on the fast path (see prompt)
    }),
  ),
  tags: z.array(z.string()),
  turningPoint: z.object({
    turn: z.number(),
    what: z.string(),
    betterMove: z.string(),
  }),
  verdict: z.string(),
});

/** Score a round and return the structured debrief. Throws if both attempts fail. */
export async function scoreRound(transcript: Transcript): Promise<CoachResult> {
  const system = coachSystemPrompt(CASE, PLAYBOOK, RUBRIC, transcript);

  async function attempt(nudge = ""): Promise<CoachResult | null> {
    const response = await anthropic.messages.create({
      model: modelFor("coach"),
      max_tokens: 2000,
      // Scoring is against an explicit rubric, so deep thinking isn't needed.
      // Free-form generation (no constrained decoding) for speed; validated below.
      // For different latency/quality, change MODEL_COACH in .env.local.
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      system,
      messages: [
        {
          role: "user",
          content:
            "Score the round now and return the debrief as a single raw JSON object (no markdown, no code fences, no prose). For dimensions give name and score ONLY — no comment field. Put your specific, turn-referenced coaching into the turningPoint (what + betterMove), the two tags, and the one-line verdict. Keep verdict and each turning-point field to one sentence." +
            nudge,
        },
      ],
    });

    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

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
  const second = await attempt(" Return ONLY valid JSON matching the exact required shape.");
  if (second) return second;
  throw new Error("Coach failed to return a valid debrief.");
}
