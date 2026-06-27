/**
 * lib/llm.ts — the reasoning-brain gateway (Cloud ↔ Local).
 *
 * Two brains behind one interface:
 *   - "claude"   (Cloud)  — Anthropic, prompt-cached, fast. Default.
 *   - "nemotron" (Local)  — NVIDIA Nemotron via OpenRouter (OpenAI-compatible).
 *                           Sovereign-mode story; slower, no prompt cache.
 *                           (Hackathon: OpenRouter; prod: on-prem local GPU.)
 *
 * The "Cloud/Local" UI toggle maps to these via brainFromMode(). The Claude path
 * keeps cache_control + thinking/effort; the Nemotron path sends a plain system
 * message and strips <think> reasoning. Voice stays on Qwen (ElevenLabs) and is
 * unaffected unless the shim is used.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type Role = "adversary" | "coach" | "amend";
export type BrainId = "claude" | "nemotron";
export type EngineMode = "cloud" | "local";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Error thrown when Local is requested but OpenRouter isn't configured. */
export const LOCAL_NO_KEY = "LOCAL_MODE_NO_KEY";

/** Lazily build the OpenRouter client (so a missing key doesn't crash Cloud). */
function openrouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error(LOCAL_NO_KEY);
  // Bound slow/failing Local calls (esp. the free tier) so we fall back to Cloud
  // promptly instead of hanging. Raise once on paid credits for big coach JSON.
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    timeout: 45_000,
    maxRetries: 0,
  });
}

/** "cloud" → claude, "local" → nemotron (default claude). */
export function brainFromMode(mode?: string | null): BrainId {
  return mode === "local" ? "nemotron" : "claude";
}

/** Resolve the model id for a brain + role (env-overridable). */
export function modelFor(brain: BrainId, role: Role): string {
  if (brain === "nemotron") {
    return process.env.MODEL_NEMOTRON || "nvidia/nemotron-3-super-120b-a12b";
  }
  if (role === "coach") return process.env.MODEL_COACH || "claude-sonnet-4-6";
  return process.env.MODEL_ADVERSARY || "claude-sonnet-4-6"; // adversary + amend
}

/** Strip Nemotron-style chain-of-thought so it never reaches the user/JSON. */
function stripReasoning(text: string): string {
  let t = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // stray unterminated reasoning: drop everything up to a lone </think>
  const close = t.lastIndexOf("</think>");
  if (close !== -1) t = t.slice(close + "</think>".length);
  return t.trim();
}

type BrainArgs = {
  brain?: BrainId;
  role?: Role;
  /** Large static prefix — cached on the Claude path. Optional. */
  rulebook?: string;
  instructions: string;
  messages: ChatMessage[];
  maxTokens?: number;
};

/**
 * Stream a brain's reply as text deltas. The Claude path streams natively with a
 * cached rulebook prefix; the Nemotron path resolves the full reply then yields
 * it once (with reasoning stripped) — fine since Local is used for typed + coach,
 * and voice runs on Qwen.
 */
export async function* streamBrain({
  brain = "claude",
  role = "adversary",
  rulebook,
  instructions,
  messages,
  maxTokens = 500,
}: BrainArgs): AsyncGenerator<string> {
  const model = modelFor(brain, role);

  if (brain === "nemotron") {
    const client = openrouterClient();
    const system = [rulebook, instructions].filter(Boolean).join("\n\n");
    const res = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    });
    yield stripReasoning(res.choices[0]?.message?.content ?? "");
    return;
  }

  const system = rulebook
    ? [
        { type: "text" as const, text: rulebook, cache_control: { type: "ephemeral" as const } },
        { type: "text" as const, text: instructions },
      ]
    : instructions;

  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
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

/** Collect a brain's full reply as a string. */
export async function generateBrain(args: BrainArgs): Promise<string> {
  let out = "";
  for await (const delta of streamBrain(args)) out += delta;
  return out.trim();
}

// --- Adversary (Technician) convenience wrappers, now brain-aware ---

export function streamAdversary(
  rulebook: string,
  instructions: string,
  messages: ChatMessage[],
  brain: BrainId = "claude",
): AsyncGenerator<string> {
  return streamBrain({ brain, role: "adversary", rulebook, instructions, messages });
}

export async function generateAdversary(
  rulebook: string,
  instructions: string,
  messages: ChatMessage[],
  brain: BrainId = "claude",
): Promise<string> {
  return generateBrain({ brain, role: "adversary", rulebook, instructions, messages });
}
