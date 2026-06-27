/**
 * app/api/admin/amend/route.ts — admin "setup assistant" chat (PLACEHOLDER).
 *
 * Framework only: a senior lawyer can describe amendments to the generated game
 * in natural language; this acknowledges the request conversationally but does
 * NOT mutate the game. Real document-driven generation + edits land later behind
 * the same chat. Reuses the Claude client from lib/llm.ts (Sonnet, fast).
 *
 * Input:  { messages: { role: "user" | "assistant", content }[] }
 * Output: { reply: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { generateBrain, brainFromMode, type ChatMessage } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM = `You are a friendly setup assistant helping a senior lawyer configure an AI negotiation training game built from their uploaded playbook/case.
- Briefly and warmly acknowledge the change they asked for, restating it in one short line.
- Make clear it will be applied automatically once document-driven generation is enabled — for now it is noted as a placeholder.
- NEVER claim you have actually changed the game. Do not invent details about their documents.
- One or two sentences. No lists.`;

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[]; engineMode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  // Honor the session's Cloud/Local posture (the firm's playbook is sensitive).
  const brain = brainFromMode(body.engineMode);
  const args = {
    role: "amend" as const,
    instructions: SYSTEM,
    messages,
    maxTokens: 200,
  };
  try {
    const reply = await generateBrain({ brain, ...args });
    return NextResponse.json({ reply });
  } catch (err) {
    if (brain === "nemotron") {
      try {
        const reply = await generateBrain({ brain: "claude", ...args });
        return NextResponse.json({ reply, fellBack: true });
      } catch {
        /* fall through */
      }
    }
    console.error("admin amend error:", err);
    return NextResponse.json(
      { error: "Amend assistant failed", detail: String(err) },
      { status: 500 },
    );
  }
}
