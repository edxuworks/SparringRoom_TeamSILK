/**
 * scripts/text-harness.mts — run a hot-seat round in the terminal (no voice).
 *
 * De-risks the brain: lets us tune the Technician's interrogation + the debrief
 * without spending ElevenLabs voice minutes. Run with:  npm run harness
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
import type { SessionSetup } from "../lib/setup";

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
const { DEFAULT_SETUP, buildHotSeatSystem } = await import("../lib/setup");
const { streamAdversary } = await import("../lib/llm");
const { scoreRound } = await import("../lib/coach");

// Defend all the essential (non-trap) clauses by default in the harness.
const setup: SessionSetup = {
  ...DEFAULT_SETUP,
  clauseIds: CASE.clauses.filter((c) => !c.isTrap).map((c) => c.id),
};

const messages: ChatMessage[] = [];
let turnCount = 0;

function stateSummary(): string {
  if (turnCount === 0) return "The hot seat is just beginning.";
  return `Turn ${turnCount}. Keep the junior's earlier answers and any concessions in mind.`;
}

async function technicianTurn(): Promise<string> {
  const { rulebook, instructions } = await buildHotSeatSystem(setup, {
    turnCount,
    summary: stateSummary(),
  });
  process.stdout.write("\nTHE TECHNICIAN: ");
  let text = "";
  for await (const delta of streamAdversary(rulebook, instructions, messages)) {
    process.stdout.write(delta);
    text += delta;
  }
  process.stdout.write("\n");
  return text.trim();
}

async function main() {
  console.log(`\n=== THE SPARRING ROOM — Hot Seat (text harness) ===`);
  console.log(`You act for ${CASE.userParty.name}. ${CASE.issue}\n`);
  console.log(`Answer the Technician. /coach to score, /quit to exit.`);

  const opener =
    "Before we start, what's your headline read on this DPA from a data-protection perspective? Biggest risk, what it means for the Trust commercially, and your recommended position. Sixty seconds.";
  console.log(`\nTHE TECHNICIAN: ${opener}`);
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
      const result = await scoreRound(transcript, setup.caseId);
      console.log(JSON.stringify(result, null, 2));
      continue;
    }

    messages.push({ role: "user", content: line });
    turnCount += 1;
    const reply = await technicianTurn();
    messages.push({ role: "assistant", content: reply });
  }
  rl.close();
  console.log("\nRound ended.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
