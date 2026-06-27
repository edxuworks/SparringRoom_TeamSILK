# The Sparring Room

*Hack the Law 2026 · Legora "Sparring Room" challenge · adaeze njiaju, divine sanusi, edward xu (Team SILK)*

A voice-first training ground where a lawyer practises real legal work against an AI
that fights back, opposing counsel that argues, probes weak points, and doesn't fold
to bare confidence, then turns coach and delivers a specific, scored debrief after
every round. Not an assistant. A sparring partner.

## Why

As AI absorbs the grunt work that used to train junior lawyers, the learn-by-doing
apprenticeship is thinning out. The Sparring Room answers that with deliberate practice:
a well-defined task, immediate feedback, and unlimited reps against genuine resistance —
the Socratic method pointed at the job instead of the textbook.

## What it does

1. **Negotiate out loud.** The lawyer argues a contract clause in real time against an
   AI opposing counsel that holds its ground and presses the weak points.
2. **Stay coherent.** An explicit game-state layer tracks every position and concession,
   so the adversary never forgets what was agreed three turns ago.
3. **Get coached.** When the round ends, the AI becomes a coach — scoring performance
   against a model playbook grounded in established negotiation theory (BATNA, ZOPA,
   interests over positions), naming the single turning point, and asking the lawyer to
   see the better move. Then: rematch, beat your last score.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 |
| Adversary & coach | Anthropic Claude (Sonnet for the live call, Opus for the debrief) |
| Real-time voice | ElevenLabs Conversational AI (ASR + TTS + turn-taking) |
| Structured output | Zod-validated coach debrief |

The voice path connects ElevenLabs to Claude via an OpenAI-compatible shim
(`/api/llm/v1/chat/completions`) that injects the case, legal grounding, and live
game-state on every turn.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # add ANTHROPIC_API_KEY + ELEVENLABS_* keys
npm run harness                     # test the brain in the terminal, zero voice cost
npm run dev                         # http://localhost:3000 — Typed or Voice mode
```

See **[RUN.md](RUN.md)** for the full voice setup (ElevenLabs agent + ngrok tunnel) and
the verification checklist.

## Project layout

```
app/api/llm/        OpenAI-compatible shim — streams Claude to ElevenLabs
app/api/coach/      End-of-round debrief (Claude Opus, structured)
app/page.tsx        Arena UI — Typed / Voice modes, scored debrief card
lib/                llm · coach · gameState · openaiCompat
prompts/            adversary · coach system prompts
data/               case · playbook · grounding · rubric (synthetic placeholders)
scripts/            text-harness · dev-voice
```

## Scope & roadmap

This is the v1 vertical slice: one arena, one scenario (a contract liability-cap
negotiation), voice in and out, and a scored debrief with one-click rematch. Everything
domain- and infra-specific sits behind clean seams — Neo4j argument graphs, an EU Cellar
API grounding feed, an independent Nemotron scorer, and lawyer-authored content all drop
in without touching the core. See the swap-out table in [RUN.md](RUN.md).

---

*All `data/` and `prompts/` content is synthetic placeholder, clearly labelled, and is
not legal advice.*
