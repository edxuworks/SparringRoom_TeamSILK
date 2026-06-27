/**
 * app/api/llm/v1/chat/completions/route.ts — the custom-LLM shim (the spine).
 *
 * This is the single most important box: ElevenLabs' Custom LLM speaks OpenAI's
 * /v1/chat/completions format; Claude does not. Per turn this route:
 *   1. parses the OpenAI request,
 *   2. assembles the REAL adversary system prompt (case + grounding + state),
 *   3. calls Claude (Sonnet) with streaming,
 *   4. translates the stream into OpenAI chat.completion.chunk SSE.
 *
 * Configure the ElevenLabs agent's Custom LLM "server URL" to:
 *     https://<your-public-tunnel>/api/llm/v1
 * (ElevenLabs appends /chat/completions). Model ID can be anything,
 * e.g. "sparring-adversary".
 */

import { NextRequest } from "next/server";
import { streamAdversary } from "@/lib/llm";
import { fetchGrounding } from "@/data/grounding";
import { CASE } from "@/data/case";
import { adversarySystemPrompt } from "@/prompts/adversary";
import { bumpTurn, getState, summarize } from "@/lib/gameState";
import {
  type OpenAIChatRequest,
  toChatMessages,
  sseRoleFrame,
  sseDeltaFrame,
  sseStopFrames,
  newCompletionId,
} from "@/lib/openaiCompat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: OpenAIChatRequest;
  try {
    body = (await req.json()) as OpenAIChatRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const model = body.model || "sparring-adversary";
  const sessionId = body.user_id || "default";
  const chat = toChatMessages(body.messages || []);

  // Game-state: minimal v1. Bump only when the user actually spoke last.
  const userSpokeLast = chat[chat.length - 1]?.role === "user";
  const state = userSpokeLast ? bumpTurn(sessionId) : getState(sessionId);

  const grounding = await fetchGrounding();
  const system = adversarySystemPrompt(CASE, grounding, {
    turnCount: state.turnCount,
    summary: summarize(state),
  });

  const id = newCompletionId();

  let closed = false; // ElevenLabs may hang up mid-turn (barge-in, end of turn)

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const safeEnqueue = (frame: Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(frame);
        } catch {
          closed = true; // controller already closed by the client disconnecting
        }
      };
      try {
        safeEnqueue(sseRoleFrame(id, model));
        for await (const delta of streamAdversary(system, chat)) {
          if (closed) break;
          safeEnqueue(sseDeltaFrame(id, model, delta));
        }
      } catch (err) {
        if (!closed) console.error("shim stream error:", err);
      } finally {
        for (const frame of sseStopFrames(id, model)) safeEnqueue(frame);
        if (!closed) {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      }
    },
    cancel() {
      closed = true; // client went away — stop enqueueing
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
