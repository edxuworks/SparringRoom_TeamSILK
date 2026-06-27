/**
 * app/api/adversary/route.ts — JSON adversary turn (typed fallback + testing).
 *
 * The canonical voice path is the OpenAI-SSE shim at /api/llm. This endpoint is
 * a plain-JSON convenience so the browser's typed-fallback mode (and quick tests
 * without a tunnel) can get an adversary reply in one call.
 *
 * Input:  { messages: {role,content}[], turnCount?, setup?: Partial<SessionSetup> }
 * Output: { reply: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAdversary, type ChatMessage } from "@/lib/llm";
import { buildHotSeatSystem, resolveSetup, type SessionSetup } from "@/lib/setup";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    messages?: ChatMessage[];
    turnCount?: number;
    setup?: Partial<SessionSetup>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  const turnCount =
    body.turnCount ?? messages.filter((m) => m.role === "user").length;
  const setup = resolveSetup(body.setup);

  const { rulebook, instructions } = await buildHotSeatSystem(setup, {
    turnCount,
    summary:
      turnCount <= 0
        ? "The hot seat is just beginning — open with the bottom-line question."
        : `Turn ${turnCount}. Keep earlier answers and any concessions in mind from the exchange above.`,
  });

  try {
    const reply = await generateAdversary(rulebook, instructions, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("adversary error:", err);
    return NextResponse.json(
      { error: "Adversary failed", detail: String(err) },
      { status: 500 },
    );
  }
}
