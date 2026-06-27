/**
 * scripts/text-harness.ts — run a negotiation round in the terminal (no voice).
 *
 * This de-risks the hard part: it lets us tune the adversary until it argues,
 * probes weaknesses, and does NOT fold to bare confidence — without spending
 * ElevenLabs voice minutes. Run with:  npm run harness
 *
 * Commands during a round:
 *   /coach   score the round so far and print the debrief
 *   /quit    exit
 */

import readline from "node:readline/promises";
import fs from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import type { ChatMessage } from "../lib/llm";

// --- minimal .env.local loader (Next.js loads it for the app; tsx does not) ---
function loadEnv() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY in .env.local first.");
  process.exit(1);
}

const { CASE } = await import("../data/case");
const { fetchGrounding } = await import("../data/grounding");
const { adversarySystemPrompt } = await import("../prompts/adversary");
const { streamAdversary } = await import("../lib/llm");
const { scoreRound } = await import("../lib/coach");

const grounding = await fetchGrounding();
const messages: ChatMessage[] = [];
let turnCount = 0;

function stateSummary(): string {
  if (turnCount === 0) return "The negotiation has not started yet.";
  return `Turn ${turnCount}. The lawyer for ${CASE.userParty.name} has made ${turnCount} point(s) so far; keep what has been agreed or contested in mind from the exchange above.`;
}

async function adversaryTurn(): Promise<string> {
  const system = adversarySystemPrompt(CASE, grounding, {
    turnCount,
    summary: stateSummary(),
  });
  process.stdout.write("\nOPPOSING COUNSEL: ");
  let text = "";
  for await (const delta of streamAdversary(system, messages)) {
    process.stdout.write(delta);
    text += delta;
  }
  process.stdout.write("\n");
  return text.trim();
}

async function main() {
  console.log(`\n=== THE SPARRING ROOM (text harness) ===`);
  console.log(`You act for ${CASE.userParty.name}. ${CASE.issue}\n`);
  console.log(`Type your negotiation turns. /coach to score, /quit to exit.`);

  // The adversary opens with pressure (mirrors the voice agent's first message).
  const opener =
    "Shall we start with the liability cap? My client won't accept your 12-month figure — given our GDPR exposure we need uncapped liability on data-protection breaches.";
  console.log(`\nOPPOSING COUNSEL: ${opener}`);
  messages.push({ role: "assistant", content: opener });

  const rl = readline.createInterface({ input, output });
  while (true) {
    const line = (await rl.question("\nYOU: ")).trim();
    if (!line) continue;
    if (line === "/quit") break;
    if (line === "/coach") {
      console.log("\n[scoring round...]\n");
      const transcript = {
        turns: messages.map((m) => ({
          role: (m.role === "assistant" ? "adversary" : "user") as
            | "user"
            | "adversary",
          text: m.content,
        })),
      };
      const result = await scoreRound(transcript);
      console.log(JSON.stringify(result, null, 2));
      continue;
    }

    messages.push({ role: "user", content: line });
    turnCount += 1;
    const reply = await adversaryTurn();
    messages.push({ role: "assistant", content: reply });
  }
  rl.close();
  console.log("\nRound ended.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
