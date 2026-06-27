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
    timeout: 20_000,
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
  // Coach defaults to Haiku — the debrief is latency-sensitive and the JSON is
  // schema-constrained, so the smaller model is plenty. Override with MODEL_COACH.
  if (role === "coach") return process.env.MODEL_COACH || "claude-haiku-4-5";
  return process.env.MODEL_ADVERSARY || "claude-sonnet-4-6"; // adversary + amend
}

/** Haiku rejects the `effort` param; only set it on models that accept it. */
function effortFor(model: string): "low" | undefined {
  return model.includes("haiku") ? undefined : "low";
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

type StructuredArgs = BrainArgs & {
  /** JSON schema the reply MUST satisfy (constrained decoding / structured output). */
  jsonSchema: Record<string, unknown>;
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
        { type: "text" as const, text: rulebook, cache_control: { type: "ephemeral" as const, ttl: "1h" as const } },
        { type: "text" as const, text: instructions },
      ]
    : instructions;

  const effort = effortFor(model);
  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    thinking: { type: "disabled" },
    ...(effort ? { output_config: { effort } } : {}),
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

/**
 * Generate a reply CONSTRAINED to a JSON schema, returned as a raw JSON string.
 *
 * Non-streaming (the structured payloads are small, well under the streaming
 * threshold) and single-pass: the Claude path uses Anthropic structured outputs
 * (`output_config.format`) so the reply is guaranteed schema-valid — no
 * parse-then-retry latency tax. The Nemotron path asks OpenRouter for a
 * json_schema response_format and strips any stray reasoning as a safety net.
 * Caller still validates (zod) but never needs a second model round-trip.
 */
export async function generateStructured({
  brain = "claude",
  role = "coach",
  rulebook,
  instructions,
  messages,
  maxTokens = 1200,
  jsonSchema,
}: StructuredArgs): Promise<string> {
  const model = modelFor(brain, role);

  if (brain === "nemotron") {
    const client = openrouterClient();
    const system = [rulebook, instructions].filter(Boolean).join("\n\n");
    const res = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      response_format: {
        type: "json_schema",
        json_schema: { name: "debrief", strict: true, schema: jsonSchema },
      },
      messages: [{ role: "system", content: system }, ...messages],
    });
    return stripReasoning(res.choices[0]?.message?.content ?? "");
  }

  const system = rulebook
    ? [
        { type: "text" as const, text: rulebook, cache_control: { type: "ephemeral" as const, ttl: "1h" as const } },
        { type: "text" as const, text: instructions },
      ]
    : instructions;

  const effort = effortFor(model);
  const res = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    thinking: { type: "disabled" },
    output_config: {
      ...(effort ? { effort } : {}),
      format: { type: "json_schema", schema: jsonSchema },
    },
    system,
    messages,
  });

  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export type ToolDef = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

/**
 * Like generateStructured, but Claude may call tools first (model-driven). Runs a
 * bounded tool loop: each `tool_use` is handed to `onToolCall`, the result is fed
 * back, and the final reply is still schema-constrained JSON. Claude-only — the
 * Nemotron path has no tool support, so callers keep it offline (Sovereign mode).
 */
export async function generateStructuredWithTools({
  role = "coach",
  rulebook,
  instructions,
  messages,
  maxTokens = 1200,
  jsonSchema,
  tools,
  onToolCall,
  maxSteps = 4,
}: StructuredArgs & {
  tools: ToolDef[];
  onToolCall: (name: string, input: unknown) => Promise<string>;
  maxSteps?: number;
}): Promise<string> {
  const model = modelFor("claude", role);
  const effort = effortFor(model);
  const system = rulebook
    ? [
        { type: "text" as const, text: rulebook, cache_control: { type: "ephemeral" as const, ttl: "1h" as const } },
        { type: "text" as const, text: instructions },
      ]
    : instructions;

  const convo: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  for (let step = 0; step < maxSteps; step++) {
    const res = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      thinking: { type: "disabled" },
      output_config: {
        ...(effort ? { effort } : {}),
        format: { type: "json_schema", schema: jsonSchema },
      },
      system,
      tools,
      messages: convo,
    });

    if (res.stop_reason === "tool_use") {
      convo.push({ role: "assistant", content: res.content });
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of res.content) {
        if (block.type === "tool_use") {
          let out: string;
          try {
            out = await onToolCall(block.name, block.input);
          } catch (e) {
            out = `Lookup failed: ${e instanceof Error ? e.message : String(e)}. Rely on the firm rulebook.`;
          }
          results.push({ type: "tool_result", tool_use_id: block.id, content: out });
        }
      }
      convo.push({ role: "user", content: results });
      continue;
    }

    return res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
  }

  throw new Error("Coach tool loop exceeded max steps.");
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
