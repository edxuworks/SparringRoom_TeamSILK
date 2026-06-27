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
import { anthropic, modelFor, type ChatMessage } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM = `You are a friendly setup assistant helping a senior lawyer configure an AI negotiation training game built from their uploaded playbook/case.
- Briefly and warmly acknowledge the change they asked for, restating it in one short line.
- Make clear it will be applied automatically once document-driven generation is enabled — for now it is noted as a placeholder.
- NEVER claim you have actually changed the game. Do not invent details about their documents.
- One or two sentences. No lists.`;

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  try {
    const res = await anthropic.messages.create({
      model: modelFor("adversary"), // fast model; this is a lightweight chat
      max_tokens: 200,
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      system: SYSTEM,
      messages,
    });
    const reply = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("admin amend error:", err);
    return NextResponse.json(
      { error: "Amend assistant failed", detail: String(err) },
      { status: 500 },
    );
  }
}
