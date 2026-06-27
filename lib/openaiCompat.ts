/**
 * lib/openaiCompat.ts — helpers to read OpenAI-format chat requests and emit
 * OpenAI-compatible streaming SSE.
 *
 * ElevenLabs' "Custom LLM" speaks OpenAI's /v1/chat/completions format; Claude
 * does not. These helpers translate both directions so the /api/llm shim can
 * inject our case + grounding + game-state and stream Claude back as if it were
 * an OpenAI model.
 */

import type { ChatMessage } from "./llm";

/** A single OpenAI message. `content` may be a string or an array of parts. */
export interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "tool" | "developer";
  content: string | Array<{ type?: string; text?: string }> | null;
}

/** The body ElevenLabs POSTs to /v1/chat/completions. */
export interface OpenAIChatRequest {
  model?: string;
  messages: OpenAIMessage[];
  stream?: boolean;
  user_id?: string;
  // elevenlabs_extra_body and other fields are ignored in v1.
  [key: string]: unknown;
}

/** Flatten OpenAI message content (string or parts) to plain text. */
function contentToText(content: OpenAIMessage["content"]): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => (typeof p === "string" ? p : (p?.text ?? "")))
      .join("");
  }
  return "";
}

/**
 * Split the incoming OpenAI messages into the user/assistant chat turns we send
 * to Claude. The agent's own (one-line) system prompt is discarded — the shim
 * assembles the REAL adversary system prompt itself.
 *
 * Anthropic requires the first message to be `user`; if ElevenLabs leads with an
 * assistant turn (the agent's first message), we keep it but prepend a minimal
 * user opener so the sequence is valid.
 */
export function toChatMessages(messages: OpenAIMessage[]): ChatMessage[] {
  const chat: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const text = contentToText(m.content).trim();
    if (!text) continue;
    chat.push({ role: m.role, content: text });
  }
  // Anthropic: messages must start with a user turn.
  if (chat.length === 0 || chat[0].role !== "user") {
    chat.unshift({ role: "user", content: "(The negotiation begins.)" });
  }
  return chat;
}

// --- SSE emit helpers (OpenAI chat.completion.chunk format) -----------------

const enc = new TextEncoder();

function chunkObject(
  id: string,
  model: string,
  delta: Record<string, unknown>,
  finishReason: string | null = null,
) {
  return {
    id,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
  };
}

/** Encode one `data: {json}\n\n` SSE frame. */
export function sseFrame(obj: unknown): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(obj)}\n\n`);
}

/** First frame: announce the assistant role. */
export function sseRoleFrame(id: string, model: string): Uint8Array {
  return sseFrame(chunkObject(id, model, { role: "assistant" }));
}

/** A content delta frame. */
export function sseDeltaFrame(
  id: string,
  model: string,
  text: string,
): Uint8Array {
  return sseFrame(chunkObject(id, model, { content: text }));
}

/** Final content frame with finish_reason, then the [DONE] terminator. */
export function sseStopFrames(id: string, model: string): Uint8Array[] {
  return [
    sseFrame(chunkObject(id, model, {}, "stop")),
    enc.encode("data: [DONE]\n\n"),
  ];
}

export function newCompletionId(): string {
  return `chatcmpl-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
