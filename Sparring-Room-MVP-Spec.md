# The Sparring Room — MVP Build Spec (v1: Voice Vertical Slice)

**For:** Claude Code (fully code-built, TypeScript)
**Goal of this slice:** prove the **voice loop** works well — a lawyer speaks, an AI opposing counsel argues back in real time, doesn't fold, and at the end gives a structured, scored debrief.
**Everything else is an intentional placeholder** behind a clean interface, to be swapped once voice is proven and the team/lawyers weigh in.

> Build philosophy: one thin vertical slice, end to end. Make the voice real; make the domain content fake-but-coherent. Do not build breadth (multiple scenarios, auth, persistence, leaderboards) in v1.

---

## 0. Definition of done (the only things that must work)

1. User clicks **Start Round**, grants mic, and has a spoken back-and-forth with an AI opposing counsel over **one contract clause**.
2. The AI **argues its side, pushes back, and does not fold** just because the user sounds confident. Turns are short and natural (it's voice).
3. The conversation is **low-latency** enough to feel like a call (target sub-second first response; rely on ElevenLabs for turn-taking).
4. User clicks **End Round** and sees a **debrief card**: an overall score, 2–4 "Strong / Improve" tags, and the single **turning point** with the stronger move.
5. A **text-mode harness** exists so the adversary/coach logic can be tested without spending voice minutes.

If those five work, the slice is a success. Nothing else matters for v1.

---

## 1. Architecture (request flow per turn)

```
                ┌─────────────────────────────────────────────┐
   mic / audio  │              ElevenLabs Agent               │  voice out
  ───────────►  │  (ASR + turn-taking + TTS, hosted)          │ ──────────►
                │  configured to use a CUSTOM LLM endpoint     │
                └───────────────┬─────────────────────────────┘
                                │ OpenAI-compatible chat request (per turn)
                                ▼
                ┌─────────────────────────────────────────────┐
                │   OUR BACKEND  /api/llm  (the "shim")        │
                │   1. load session game-state                 │
                │   2. assemble system prompt:                 │
                │      persona + CASE + GROUNDING + STATE      │
                │   3. call Claude via provider gateway        │
                │   4. (optionally) update game-state          │
                │   5. stream tokens back as OpenAI SSE        │
                └───────────────┬─────────────────────────────┘
                                │
                                ▼  provider gateway (lib/llm.ts)
                       Claude Sonnet  ── (swap) ──►  Nemotron (Sovereign Mode)

   End Round ─► /api/coach ─► Claude Opus ─► structured JSON debrief ─► card
```

**Why the shim exists:** ElevenLabs' "custom LLM" speaks OpenAI's chat format; Claude does not. The shim translates, and — more importantly — it's where we **inject the case, the legal grounding, and the live game-state** into every turn. This injection point is the thing that makes the adversary stateful and grounded. It's the single most important box.

---

## 2. Tech stack & setup

- **Framework:** Next.js (App Router) + TypeScript. One project = frontend + API routes. Easiest for Claude Code to scaffold, run, and deploy.
- **Voice:** ElevenLabs Agents (Conversational AI) via the official web SDK (`@elevenlabs/react`). **Verify exact SDK method names against current ElevenLabs docs** — that surface changes; don't trust memory.
- **LLM:** `@anthropic-ai/sdk` for Claude. Sonnet for in-round adversary; Opus for the coach.
- **Validation:** `zod` to validate the coach's JSON output.
- **Styling:** Tailwind. Keep the UI minimal and clean.

**Environment variables (`.env.local`):**
```
ANTHROPIC_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...
NVIDIA_API_KEY=...            # optional, Nemotron (Sovereign Mode / scorer swap)
PERPLEXITY_API_KEY=...        # optional, research role only (NOT adversary/coach)
MODEL_ADVERSARY=claude        # claude | nemotron
MODEL_COACH=claude            # claude | nemotron
```
EU Cellar needs no auth (placeholder stub for now anyway).

---

## 3. Repo layout

```
/app
  /page.tsx                  # the call screen + debrief card (single page)
  /api/llm/route.ts          # custom-LLM shim (ElevenLabs -> Claude, OpenAI-compatible SSE)
  /api/coach/route.ts        # end-of-round scoring -> structured JSON
  /api/elevenlabs/signed-url/route.ts  # mints a signed URL so the API key stays server-side
/lib
  /llm.ts                    # provider gateway: generate({provider, model, system, messages, stream})
  /gameState.ts              # JSON game-state schema + in-memory store + update logic  [PLACEHOLDER -> Neo4j]
  /openaiCompat.ts           # helpers to read OpenAI-format requests & emit OpenAI SSE
/data                        # >>> ALL PLACEHOLDER, SWAP AFTER LAWYERS <<<
  /case.ts                   # the synthetic scenario + the user's brief + ZOPA/BATNA facts
  /playbook.ts               # the "model answer" / ideal path
  /grounding.ts              # placeholder EU/GDPR snippet + fetchGrounding() stub  [PLACEHOLDER -> Cellar]
  /rubric.ts                 # the evaluation metric (research-based)
/prompts
  /adversary.ts              # adversary system-prompt template
  /coach.ts                  # coach system-prompt template
/scripts
  /text-harness.ts           # run a round in the terminal (no voice) to test the brain
```

---

## 4. Component specs

### 4.1 Frontend (`app/page.tsx`)
Minimal single page, two states:

- **Call view:** a "Start Round" button → requests mic → starts the ElevenLabs session using a signed URL fetched from `/api/elevenlabs/signed-url`. Show a live status (listening / AI speaking), a running transcript, and an "End Round" button. A small case-context banner ("You act for TechVendor Ltd. Negotiate the liability cap.").
- **Debrief view:** on End Round, send the transcript + sessionId to `/api/coach`, render the returned JSON as a card: big **score**, the **Strong/Improve tags**, the **turning point** block ("On turn N you… A stronger move: …"), one-line verdict, and a **"Go Again"** button that resets to the call view.

No routing, no auth, no DB. Keep all session state in React state + an in-memory server store keyed by a generated `sessionId`.

### 4.2 ElevenLabs integration
- **Agent config (in ElevenLabs dashboard):** create one agent; set its LLM to **Custom LLM** pointing at `https://<your-app>/api/llm`. Keep the agent's own system prompt minimal (a one-liner) — the *real* prompt is assembled by our shim. Pick a firm, professional **voice** for opposing counsel. Set a short **first message** ("Shall we start with the liability cap? My client won't accept your 12-month figure.") so the AI opens the pressure.
- **Signed URL route:** `/api/elevenlabs/signed-url` uses `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` server-side to mint a conversation token / signed URL and returns it to the client. The client never sees the key. **Confirm the exact endpoint/method in current ElevenLabs docs.**
- **Client:** use `@elevenlabs/react` to start/stop the session and surface transcript events for the live transcript + to capture the full transcript for the coach.

### 4.3 Custom-LLM shim (`app/api/llm/route.ts`)
This is the spine. Per request from ElevenLabs:
1. Parse the OpenAI-format body (`messages`, `stream`, etc.) and the `sessionId` (pass it via the agent's metadata / a custom field; if ElevenLabs can't pass it cleanly, key state on the conversation id it provides).
2. Load game-state for the session (create if first turn).
3. **Assemble the system prompt** = `adversaryPrompt(CASE, GROUNDING, gameState)` (see `/prompts/adversary.ts`). Prepend it; keep the user/assistant turns ElevenLabs sent.
4. Call Claude **Sonnet** via the provider gateway with `stream: true`.
5. Translate Claude's streaming output into **OpenAI-compatible SSE chunks** (`chat.completion.chunk` deltas, ending with `[DONE]`). Use `lib/openaiCompat.ts`.
6. (Optional v1) do a cheap game-state update — e.g. increment turn count, and append the assistant text. Rich state tracking is deferred (see §6).

Keep the adversary prompt **tight** and the model **fast** — time-to-first-token is what the user perceives. Put grounding facts in the prompt now (small); move to RAG later.

### 4.4 Provider gateway (`lib/llm.ts`) — role-keyed
A single `generate()` abstraction, but provider is chosen **per role**, not globally — because swappability ≠ suitability:
```ts
type Role = "adversary" | "coach" | "research";
type GenArgs = { role: Role; system: string; messages: Msg[]; stream?: boolean };

// Role -> provider mapping (env-overridable):
//   adversary -> claude (default)  | nemotron (Sovereign-Mode swap)
//   coach     -> claude (default)  | nemotron (independent-judge swap)
//   research  -> perplexity         (OPTIONAL, separate call — live web-grounded facts w/ citations)
//
// Providers (all OpenAI-compatible except Claude, which the shim/gateway adapts):
//   claude     -> @anthropic-ai/sdk
//   nemotron   -> OpenAI client, base_url https://integrate.api.nvidia.com/v1
//   perplexity -> OpenAI client, base_url https://api.perplexity.ai   (model: sonar / sonar-pro)
export async function generate(args: GenArgs): Promise<Stream | string>
```
**Suitability notes (important):** Claude is the v1 default for `adversary` and `coach`. **Nemotron** is a clean swap for either (Sovereign-Mode on-prem story for the adversary; different-family independent judge for the coach) — wiring it is cheap; making it the live default is not the goal. **Perplexity is NOT a drop-in for adversary/coach** — it's a *search* model that web-grounds every response, so it would derail an in-character negotiation turn and would score against the open web instead of your playbook. It belongs only in the optional `research` role (scenario generation / current-facts grounding), and even there EU Cellar is the better legal-grounding source for this build. Keep `research` unused in v1.

### 4.5 Coach endpoint (`app/api/coach/route.ts`)
Input: `{ sessionId, transcript }`. Steps:
1. Load CASE, PLAYBOOK, RUBRIC, gameState.
2. Build `coachPrompt(...)` (see `/prompts/coach.ts`).
3. Call Claude **Opus** (quality matters, latency doesn't).
4. Parse + `zod`-validate the JSON. On parse failure, retry once with a "return valid JSON only" nudge.
5. Return the structured debrief.

> **Swap point:** the coach/scorer call is the natural home for **NVIDIA Nemotron** later — a *different model family* grading the round than the one that generated it, which avoids correlated blind spots. For v1, Claude Opus scores; mark the swap in a comment.

### 4.6 Game state (`lib/gameState.ts`) — PLACEHOLDER → Neo4j
v1 schema (in-memory `Map<sessionId, GameState>`):
```ts
type GameState = {
  sessionId: string;
  turnCount: number;
  transcript: { role: "user" | "adversary"; text: string }[];
  // lightweight derived flags (optional in v1; can be left empty and computed at coach time)
  flags: string[];            // e.g. "conceded_uncapped_data_breach"
};
```
Keep it minimal in v1 — do the heavy analysis once, at the end, in the coach. The **swap** is to model this as a Neo4j graph (positions/concessions/moves + the playbook's ideal path) so scoring becomes path-vs-optimal and "replay the turning point" falls out for free. Do **not** build that now.

---

## 5. Placeholder domain content (provided below — swap after lawyers)

### 5.1 `data/case.ts` — the synthetic scenario
> SYNTHETIC. Plausible but invented. Replace with a lawyer-authored scenario.

- **Arena:** negotiation table (one clause).
- **Matter:** the **limitation of liability clause** in a SaaS services agreement between **TechVendor Ltd** (supplier — *the user's client*) and **ClientCorp plc** (customer — *the AI's client*).
- **The user acts for TechVendor.** The AI is ClientCorp's opposing counsel.
- **User's brief (their instructions / what "their client" wants):**
  - *Target:* cap all liability at **100% of fees paid in the prior 12 months**; exclude indirect/consequential loss.
  - *Acceptable:* general cap up to **150%** of 12-month fees. A separate **data-protection sub-cap up to 2×** annual fees is tolerable if pushed.
  - *Reservation point (walk-away):* **never agree to *uncapped* liability for data breaches**, and **no general cap above 150%**. (Death/personal injury, fraud and other non-excludable heads are always uncapped — that's standard law, not a concession.)
  - *Leverage:* TechVendor holds ISO 27001 + SOC 2; ClientCorp is 6 months into migration with no easy alternative supplier → **ClientCorp's BATNA is weak**, and a strong user should use that.
- **AI's objectives (ClientCorp):** push for **uncapped** liability for data-protection breaches (citing GDPR exposure); failing that, a **3× super-cap**; general cap at **2×**. Invoke regulatory risk, fairness, and "market standard."
- **ZOPA:** a deal exists roughly between **1× and 2×** annual fees **with a data-breach *sub-cap* (not uncapped)**. Agreeing to *uncapped* data-breach liability is **below the user's reservation point** — i.e. the "agreement trap" / conceding too early.

### 5.2 `data/playbook.ts` — the model answer ("good" looks like this)
> SYNTHETIC. Replace with the lawyers' playbook.

The strong path:
1. **Anchor low, with justification** — open at the 12-month cap and frame it as proportionate and market-standard, not arbitrary.
2. **Probe the real interest** — surface that ClientCorp's true concern is *data-breach / regulatory exposure*, not liability in general. Separate that issue from the general cap so the scary scenario doesn't inflate the whole number.
3. **Trade, don't cave** — offer a **data-protection sub-cap** (e.g. 2×) and/or a security-audit right *in exchange for* keeping the general cap low. Invent options instead of haggling one number.
4. **Use objective criteria** — market-standard caps; the point that truly uncapped liability is uninsurable and would simply be priced back into the fees (legitimacy, not just assertion).
5. **Hold the reservation point** — never concede uncapped data-breach liability; if pressed hard, lean on ClientCorp's weak alternative (their migration sunk cost) rather than folding.
6. **Ideal landing:** general cap ~1.5×, data-protection sub-cap ~2× with carve-back, non-excludables uncapped.

**Common junior mistakes (the coach should look for these):** conceding uncapped data-breach liability under GDPR pressure (the trap); negotiating only the number while ignoring interests; over-anchoring then caving fast (credibility loss); forgetting their own leverage.

### 5.3 `data/grounding.ts` — PLACEHOLDER → EU Cellar
> A small placeholder grounding fact, behind a `fetchGrounding()` stub. The swap is a real Cellar SPARQL/REST fetch.

```ts
// PLACEHOLDER. Verify exact citation/wording via EU Cellar before relying on it.
export const GROUNDING = {
  ref: "Regulation (EU) 2016/679 (GDPR), Article 82",
  gist: "Gives individuals a right to compensation for material or non-material damage caused by an infringement of the Regulation; controllers/processors can be liable. This is why a customer like ClientCorp argues for uncapped liability on data-protection breaches.",
  note: "SYNTHETIC SUMMARY — replace with verified text fetched from publications.europa.eu (Cellar). Do not present as legal advice."
};
export async function fetchGrounding() { return GROUNDING; } // swap: real Cellar query
```
This makes the adversary's GDPR argument *credible* in the demo while staying honestly labelled. The real Cellar fetch is a clean later swap.

### 5.4 `prompts/adversary.ts`
System-prompt template (inject `CASE`, `GROUNDING`, `gameState`):

> You are opposing counsel for **ClientCorp plc**, negotiating the limitation-of-liability clause against the lawyer for TechVendor Ltd. You are experienced, commercially sharp, and professional but firm. Your job is to get the **best deal for ClientCorp**: ideally **uncapped liability for data-protection breaches** (you may cite the reality of GDPR Article 82 exposure), or failing that a high super-cap; and a general cap around 2× annual fees.
>
> Rules:
> - This is a **live spoken negotiation**. Keep each turn **short — 2 to 4 sentences.** No monologues, no bullet points.
> - **Argue, counter, and probe.** Find the weak points in their reasoning and press them.
> - **Do not fold just because they sound confident.** Concede only to genuinely strong, well-grounded arguments — and when you do, concede **realistically and incrementally**, the way a real counterparty would.
> - You have sensible limits: a well-prepared opponent who uses market standard, your weak alternative, and a fair sub-cap *can* move you toward a deal in the 1×–2× range with a data-breach sub-cap. Let a strong performance win.
> - Stay fully in character. Never mention being an AI, never break frame, never coach the user mid-round.
>
> Current state of the negotiation: {gameState summary}

### 5.5 `prompts/coach.ts`
After the round. Inject `CASE`, `PLAYBOOK`, `RUBRIC`, full transcript. Instruct **strict JSON only**:
```json
{
  "score": 0,
  "batnaHeld": true,
  "dimensions": [{ "name": "BATNA discipline", "score": 0, "comment": "" }],
  "tags": ["Strong: ...", "Improve: ..."],
  "turningPoint": { "turn": 0, "what": "", "betterMove": "" },
  "verdict": "one line"
}
```
Tone: **Socratic** — comments should, where possible, ask the user to see the move themselves ("You dropped the sub-cap ask on turn 4 — what leverage were you still holding?") rather than only lecturing. Ground every judgement in the playbook and the named frameworks (BATNA, ZOPA, interests-vs-positions). The **turning point** is the single most decisive moment (usually where BATNA discipline broke or a key concession happened).

---

## 6. Evaluation metric (research-based placeholder)

> Grounded in Fisher, Ury & Patton, *Getting to Yes* / Harvard Program on Negotiation. Placeholder weights — tune with the lawyers.

Six dimensions, scored 0–5:

1. **BATNA discipline (gate).** Did they stay above their reservation point — never conceding uncapped data-breach liability or a cap above 150%? *Crossing it caps the overall score* (you cannot score well on a deal worse than your walk-away — this operationalises "conceded too early").
2. **Anchoring & positioning.** Did they open strongly and hold a credible anchor, vs accepting the other side's frame?
3. **Interests over positions.** Did they surface ClientCorp's real interest (data-breach/regulatory risk) and address *that*, vs only haggling a number?
4. **Objective criteria / legitimacy.** Did they justify with market standard, insurability, GDPR reality — vs bare assertion?
5. **Value creation.** Did they invent options (sub-cap, audit right, trade-offs) rather than pure win-lose haggling?
6. **Composure under pressure.** Did they hold position when pushed, without folding or overplaying a weak hand?

**Overall score** = weighted average × BATNA gate. Default weights: BATNA 30%, Interests 20%, Value creation 15%, Anchoring 15%, Legitimacy 10%, Composure 10%. The **score to beat** on replay is simply the previous round's overall.

---

## 7. Swap-out map (what's fake now → what it becomes)

| Placeholder (v1) | Becomes | Trigger |
|---|---|---|
| `data/case.ts` synthetic case | Lawyer-authored scenario(s) | After team session |
| `data/playbook.ts` my model answer | Lawyers' real playbook + gold answers | After team session |
| `data/grounding.ts` GDPR stub | Live EU **Cellar** fetch (SPARQL/REST) | Once voice is proven |
| `lib/gameState.ts` JSON in-memory | **Neo4j** argument graph + path scoring | Once text loop is solid |
| Coach = Claude Opus | **NVIDIA Nemotron** independent scorer | Once scoring stabilises |
| Adversary = Claude (cloud) | **Nemotron Sovereign Mode** (on-prem twin) | Vision / enterprise demo toggle |
| ElevenLabs (cloud voice) | **Nemotron Speech** on-prem twin | Vision slide only |
| (no live research call) | **Perplexity Sonar** `research` role — scenario generation / current-facts grounding | Optional; only if a scenario needs current real-world facts |
| No persistence | Supabase/Postgres for progress + score-to-beat | Post-MVP |

Every placeholder lives behind a function or a data module, so each swap is local and low-risk.

---

## 8. Build order (do it in this sequence)

1. **Scaffold** Next.js + TS + Tailwind; add env plumbing and the `/data` + `/prompts` modules (paste the content above).
2. **Brain first, in text.** Build `lib/llm.ts` (Claude) + the adversary prompt + `scripts/text-harness.ts`. Have a *typed* negotiation in the terminal until the adversary feels real and doesn't fold. **This de-risks the hard part before spending voice minutes.**
3. **Coach.** Build `/api/coach` + the rubric; run it on a harness transcript; confirm clean JSON + sensible turning point.
4. **Shim.** Build `/api/llm` (OpenAI-compatible SSE) and point a curl/OpenAI-client test at it to confirm the translation streams correctly.
5. **Voice.** Create the ElevenLabs agent (custom LLM → your `/api/llm`), build `/api/elevenlabs/signed-url` + the client call screen. Get a real spoken round working.
6. **Debrief UI** + Go Again. Polish latency and turn-taking feel.
7. **(Only if time)** wire the Nemotron Sovereign-Mode toggle as a demo flourish.

---

## 9. 60-second demo script (what you'll show)

"I act for a software vendor. I'm negotiating the liability cap against opposing counsel — who's an AI." → Start Round → speak: *"Our standard cap is 12 months' fees, that's market."* → AI pushes back hard on data-breach liability citing GDPR → user trades a data-breach sub-cap for holding the general cap → End Round → debrief card: **score, "Strong: used your leverage / Improve: you flirted with an uncapped concession on turn 4," the turning point, Go Again.** Then (optional) flip **Sovereign Mode** → "same app, now the model runs on-prem, nothing leaves the firm."

---

## 10. Risks & fallbacks

- **Voice flakiness on the day** → keep the `text-harness` path wired into the UI as a **typed fallback** so you can always demo the brain + debrief.
- **Custom-LLM/SSE translation is the riskiest integration** → build and test it (step 4) *before* touching ElevenLabs.
- **Latency** → fast model + tight prompt + stream tokens; don't do per-turn heavy state work in v1.
- **Coach returns bad JSON** → zod-validate + one retry; fall back to a plain-text debrief if needed.
- **Scope creep** → if behind, cut to: one scenario, Claude-only, text fallback. The thesis still demos.

---

*All `/data` and `/prompts` content here is synthetic placeholder authored to make the slice runnable today. None of it is legal advice; replace with lawyer-authored material before any real use.*
