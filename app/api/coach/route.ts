/**
 * app/api/coach/route.ts — end-of-round scoring endpoint.
 *
 * Input:  { transcript: { turns: { role: "user" | "adversary", text }[] } }
 * Output: CoachResult (see prompts/coach.ts) — headline, score (/100),
 *         consequences, gotRight, gaps, faultyAssumptions, trapsPicked,
 *         learningPoints, beforeYouGoBack. (+ fellBack:true if Local→Cloud.)
 *
 * Thin wrapper over lib/coach.ts#scoreRound (shared with the text harness).
 * The Cloud/Local engine is chosen from setup.engineMode; Local (Nemotron)
 * failures fall back to Cloud (Claude) so the debrief always renders.
 */

import { NextRequest, NextResponse } from "next/server";
import { scoreRound } from "@/lib/coach";
import { brainFromMode } from "@/lib/llm";
import { resolveSetup, type SessionSetup } from "@/lib/setup";
import type { Transcript } from "@/prompts/coach";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let body: {
    transcript?: Transcript;
    caseId?: string;
    setup?: Partial<SessionSetup>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const transcript = body.transcript;
  if (!transcript || !Array.isArray(transcript.turns) || transcript.turns.length === 0) {
    return NextResponse.json(
      { error: "Missing transcript.turns" },
      { status: 400 },
    );
  }

  const setup = resolveSetup(
    typeof body.setup === "object" ? body.setup : { caseId: body.caseId },
  );
  const brain = brainFromMode(setup.engineMode);
  try {
    const result = await scoreRound(transcript, setup, brain);
    return NextResponse.json(result);
  } catch (err) {
    // Local (Nemotron) unavailable → fall back to Cloud (Claude).
    if (brain === "nemotron") {
      try {
        const result = await scoreRound(transcript, setup, "claude");
        return NextResponse.json({ ...result, fellBack: true });
      } catch {
        /* fall through */
      }
    }
    console.error("coach error:", err);
    return NextResponse.json(
      { error: "Scoring failed", detail: String(err) },
      { status: 500 },
    );
  }
}
