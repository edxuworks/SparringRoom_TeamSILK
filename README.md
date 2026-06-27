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
