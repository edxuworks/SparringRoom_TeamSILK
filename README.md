# The Sparring Room

*Hack the Law 2026 · Legora "Sparring Room" challenge · adaeze njiaju, divine sanusi, edward xu (Team SILK)*

A voice-first training ground where a junior lawyer is put **in the hot seat** by an AI
that fights back — opposing counsel ("**the Technician**") that interrogates their
reasoning, presses the weak points, and won't fold to bare confidence — then turns coach
and delivers a specific, scored debrief graded against the firm's own playbook. Not an
assistant. A sparring partner.

## Why

As AI absorbs the grunt work that used to train junior lawyers, the learn-by-doing
apprenticeship is thinning out. The Sparring Room answers that with deliberate practice:
a well-defined task, genuine resistance, and an honest, grounded debrief — the firm's
hot-seat method pointed at the job instead of the textbook.

## What it does

**Junior path** — pick a case → choose your opponent (personality + difficulty) → read
the case background and select the clauses you'll defend → go into the round **by voice or
typed** → the Technician grills you on your choices → end the round and get a **scored
debrief**. The demo scenario is *Marlin Health Trust v Nemo*, a Data Processing Agreement
for children's health records run through Nemo's AI diagnostics.

**Admin path** — a senior uploads the firm's playbook → the game is generated
(Wizard-of-Oz for the demo) → test it as a junior → refine it with natural-language
amendments.

**Grounded, not generic.** Both the questioning *and* the grading are driven by the
firm's real material in [`knowledge/`](knowledge/) — the Hot Seat method, a data-protection
contract checklist, and a gold-standard playbook. The Technician hunts the issues the
playbook says matter and the debrief scores against its gold-standard answers (including
penalising "trap" clauses) — it is not improvising negotiation theory.

## Sovereign Mode — Cloud vs Local

A corner toggle switches the **reasoning brain** between two modes, framed as a
data-sovereignty choice rather than a model picker:

| | **Cloud** (default) | **Local** (sovereign) |
|---|---|---|
| Model | Anthropic Claude | NVIDIA Nemotron (via OpenRouter; in production: on-prem GPU) |
| Trade-off | Fast, prompt-cached | Slower, but data stays in your environment |
| UI | Light theme | Whole UI flips to a black "sovereign" theme |

Local failures fall back to Cloud gracefully, so the app never breaks. The story: *the
same tool a firm runs in the cloud can run entirely on-prem when the matter is sensitive.*

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 |
| Cloud brain | Anthropic Claude — prompt-cached firm rulebook (Technician + debrief) |
| Local brain | NVIDIA Nemotron via OpenRouter (OpenAI-compatible) |
| Real-time voice | ElevenLabs Conversational AI (ASR + TTS + turn-taking) |
| Structured output | Zod-validated coach debrief |
| Type | Inter + Playfair Display (matching legora.com) |

The voice path connects ElevenLabs to our backend via an OpenAI-compatible shim
(`/api/llm/v1/chat/completions`) that injects the case, the firm rulebook, and live
game-state on every turn.

## Architecture & key decisions

Three design problems carried most of the weight. Each was solved behind a clean seam so
the demo stays simple while the hard parts stay swappable.

### 1. Playbooks as the single source of truth

The firm's real material lives in [`knowledge/`](knowledge/) — the Hot Seat **method**
(`SKILL.md`), a data-protection contract **checklist**, and the **gold-standard playbook**
(scenarios, model answers, the issues to hunt, pushback lines, trap clauses, scoring).
`lib/skill.ts` reads these once at boot and concatenates them into one `RULEBOOK` string.

- **One rulebook drives both roles of the AI.** The same `RULEBOOK` is fed to the
  Technician *when questioning* and to the coach *when grading* — so the questions a junior
  is asked and the standard they're marked against can never drift apart. The gold-standard
  answers stay server-side and are **never** sent to the browser.
- **Static / volatile split for caching.** The large, unchanging rulebook is sent as a
  cached system *prefix* (Anthropic prompt caching, `cache_control`), while the small
  per-round block — case, persona, difficulty, chosen clauses, live game-state — is the
  volatile suffix (`lib/setup.ts`). Repeated turns re-read ~10k cached tokens instead of
  re-paying for them.
- **Playbook is data, not code.** Drop any `.md` into `knowledge/` and it's auto-appended
  at next boot — no code change. The admin "upload a playbook" flow is the productised
  version of exactly this seam.
- **Trade-off:** prompt caching is Cloud-only; the Local brain re-sends the rulebook every
  turn (slower) — see decision 3.

### 2. Multi-user: junior vs senior/admin (two flows, one engine)

Both roles share the same case, grounding, and brain, but their journeys diverge:

| Junior (practise) | Senior / Admin (author & configure) |
|---|---|
| case → opponent → clauses → **round** → scored debrief | upload playbook → game generated → **test as a junior** → natural-language amendments |

- **One wizard state machine, not two apps.** `app/page.tsx` drives a single `Step` union
  for both paths, so shared session state (chosen case, opponent, *and the Cloud/Local
  brain*) lives in one place and "Test it" drops the admin straight into the junior flow
  with zero context loss.
- **Content is placeholder behind seams.** Personalities, difficulty, and the admin
  amendments chat are deliberately stubbed (lawyers author the real versions). The
  amendments chat is **Wizard-of-Oz** — it acknowledges changes conversationally without
  mutating the game yet, so the demo reads as real while the generation pipeline remains
  future work.

### 3. Local ↔ Cloud: one brain interface, two providers

`lib/llm.ts` is a small gateway exposing `streamBrain` / `generateBrain` over **Claude**
(Anthropic SDK) and **NVIDIA Nemotron** (OpenRouter, OpenAI-compatible); `brainFromMode()`
picks based on the session.

- **Provider-appropriate prompts from one call site.** The rulebook and per-round
  instructions are passed as *separate* arguments, so the Cloud path can keep them as
  distinct cached system blocks while the Local path collapses them into a single system
  message — same prompt, shaped for each provider.
- **A product decision, not a model picker.** Surfaced as a persistent **Cloud / Local**
  corner toggle framed around *data sovereignty* (residency), which also flips the whole UI
  to a dark "sovereign" theme. The choice rides in `SessionSetup.engineMode`, so it applies
  uniformly to the Technician, the typed path, the shim, and the coach.
- **Resilient by default.** Local failures (missing key, timeout, malformed JSON) fall back
  to Cloud with a UI note, and a 45s timeout bounds the slow free tier — the app never
  breaks on a brain switch.
- **Voice is its own seam.** Today voice runs on ElevenLabs' built-in agent (baked
  Technician prompt) for reliable low-latency turns; the OpenAI-compatible shim
  (`/api/llm`) is the seam to route voice through the same Cloud/Local brain later.

## Quick start

```bash
npm install
cp .env.local.example .env.local    # add ANTHROPIC_API_KEY + ELEVENLABS_* (+ OPENROUTER_API_KEY for Local)
npm run harness                     # test the brain in the terminal, zero voice cost
npm run dev                         # http://localhost:3000 — Typed or Voice mode
```

See **[RUN.md](RUN.md)** for the full voice setup (ElevenLabs agent + tunnel) and the
verification checklist. The pitch deck is in
[`presentation/`](presentation/sparring-room-deck.pdf).

## Project layout

```
app/page.tsx        Wizard state machine — junior + admin flows, Cloud/Local toggle
app/api/llm/        OpenAI-compatible shim — streams the brain to ElevenLabs
app/api/coach/      End-of-round debrief (structured, zod-validated)
app/api/adversary/  Typed-mode Technician turn (JSON)
app/api/admin/      Wizard-of-Oz amendments chat
components/         EngineToggle (Cloud/Local), CallView, DebriefView, MicOrb, …
lib/                llm (Cloud/Local brain) · coach · setup · skill (rulebook loader) · gameState · openaiCompat
prompts/            hotseat (the Technician) · coach (the debrief)
data/               case · cases · personas · difficulties (synthetic placeholders)
knowledge/          firm rulebook loaded at boot — SKILL.md · checklist · gold-standard playbook
docs/               specs, wireframes, design + feature notes
presentation/       pitch deck (HTML source + exported PDF)
```

## Scope & roadmap

This is the v1 vertical slice: the junior + admin flows, one grounded scenario, voice and
typed rounds, a rulebook-grounded scored debrief, and the Cloud/Local sovereignty switch.
Everything domain- and infra-specific sits behind clean seams — Neo4j argument graphs, an
EU Cellar API grounding feed, Perplexity research, and lawyer-authored content all drop in
without touching the core. See the swap-out table in [RUN.md](RUN.md).

---

*All `data/`, `prompts/`, and `knowledge/` content is synthetic / placeholder, clearly
labelled, and is not legal advice.*
