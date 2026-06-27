/**
 * lib/llm.ts — role-keyed provider gateway.
 *
 * Provider is chosen PER ROLE, not globally, because swappability != suitability:
 *   - adversary -> Claude Sonnet (fast, low-latency for the live voice call)
 *                  [SWAP -> NVIDIA Nemotron for on-prem "Sovereign Mode"]
 *   - coach     -> Claude Opus  (quality matters, latency doesn't)
 *                  [SWAP -> NVIDIA Nemotron as an independent, different-family judge]
 *   - research  -> Perplexity Sonar (live web-grounded facts) — NOT used in v1.
 *
 * v1 is Claude-only. The role->model map is env-overridable (MODEL_ADVERSARY,
 * MODEL_COACH). The Nemotron/Perplexity branches are deliberate seams for later.
 */

import Anthropic from "@anthropic-ai/sdk";

export type Role = "adversary" | "coach" | "research";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Resolve the model id for a role (env-overridable). */
export function modelFor(role: Role): string {
  switch (role) {
    case "adversary":
      return process.env.MODEL_ADVERSARY || "claude-sonnet-4-6";
    case "coach":
      return process.env.MODEL_COACH || "claude-opus-4-8";
    case "research":
      // SWAP point: Perplexity Sonar. Unused in v1.
      throw new Error("research role is not wired in v1");
  }
}

/**
 * Stream the adversary's next spoken turn as text deltas.
 *
 * Tuned for time-to-first-token: thinking disabled, low effort, short cap
 * (the adversary speaks 2-4 sentences). Used by the /api/llm shim and the
 * terminal text-harness.
 */
export async function* streamAdversary(
  system: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const stream = anthropic.messages.stream({
    model: modelFor("adversary"),
    max_tokens: 400,
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/** Non-streaming convenience: collect the adversary's full turn as a string. */
export async function generateAdversary(
  system: string,
  messages: ChatMessage[],
): Promise<string> {
  let out = "";
  for await (const delta of streamAdversary(system, messages)) out += delta;
  return out.trim();
}
