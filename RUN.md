# The Sparring Room — running the MVP

A voice-first hot-seat trainer: a junior lawyer defends contract clauses out loud against "the Technician" — an AI that interrogates and won't fold — then gets a scored debrief graded against the firm rulebook. The reasoning brain runs **Cloud** (Claude) or **Local** (NVIDIA Nemotron via OpenRouter) via the in-app toggle. Synthetic placeholder case content; everything domain/infra-specific sits behind clean seams (see `docs/MVP-Spec.md`).

## 1. Add your keys

Copy `.env.local.example` to `.env.local` and fill it in:

```
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...        # filled in step 3
OPENROUTER_API_KEY=sk-or-...   # only needed for Local (Sovereign) mode
```

Cloud models are pinned via `MODEL_ADVERSARY` / `MODEL_COACH` (both default `claude-sonnet-4-6`; swap the coach to `claude-opus-4-8` for max nuance). Local uses `MODEL_NEMOTRON`. Override any via env — see `lib/llm.ts`.

## 2. Test the brain with zero voice cost

```
npm run harness          # typed negotiation in the terminal; /coach to score, /quit to exit
```

Confirm the Technician interrogates, probes weak points, and doesn't fold to bare confidence; `/coach` returns a structured debrief scored against the firm rulebook (and penalised if you defend a trap clause).

You can also drive the brain in the browser: `npm run dev` → open http://localhost:3000 → toggle **Typed** → Start Round. (No tunnel needed for typed mode.)

## 3. Wire up voice (ElevenLabs)

The agent's Custom LLM must be able to reach your machine, so expose it:

```
npm run dev              # http://localhost:3000
ngrok http 3000          # in another terminal -> https://<id>.ngrok.app
```

In the ElevenLabs dashboard, create one Conversational AI agent:
- **LLM** → *Custom LLM*
  - **Server URL:** `https://<id>.ngrok.app/api/llm/v1`  (ElevenLabs appends `/chat/completions`)
  - **Model ID:** `sparring-adversary` (any string)
  - Add a secret named **`OPENAI_API_KEY`** (any value — the shim doesn't check it; ElevenLabs just requires the field).
- **Voice:** pick a firm, professional voice.
- **First message:** `Shall we start with the liability cap? My client won't accept your 12-month figure.`
- **System prompt:** keep it a one-liner — the real prompt is assembled by our shim.
- Copy the **Agent ID** into `.env.local` as `ELEVENLABS_AGENT_ID`, then restart `npm run dev`.

Open http://localhost:3000 → **Voice** mode → Start Round → grant mic → negotiate → End Round → debrief → Go Again.

## Architecture (per turn)

```
mic -> ElevenLabs agent --(OpenAI /v1/chat/completions, SSE)--> /api/llm  (the shim)
         shim injects case + firm rulebook + game-state, calls the brain, streams back
End Round -> /api/coach -> the brain (zod structured output) -> debrief card
```

The "brain" is Cloud (Claude) or Local (Nemotron via OpenRouter), chosen by the in-app toggle (`lib/llm.ts`). Key files: `prompts/{hotseat,coach}.ts`, `data/{case,cases,personas,difficulties}.ts` (synthetic placeholders), `knowledge/` (firm rulebook, loaded by `lib/skill.ts`), `lib/{llm,coach,setup,skill,openaiCompat,gameState}.ts`, `app/api/{llm,coach,adversary,admin,elevenlabs/signed-url}/...`, `app/page.tsx`.

## Verification checklist

- [ ] `npm run harness` — adversary holds its ground; `/coach` returns valid JSON.
- [ ] `npm run build` — passes (already green).
- [ ] Shim SSE: `curl -N -X POST http://localhost:3000/api/llm/v1/chat/completions -H 'Content-Type: application/json' -d '{"model":"x","stream":true,"messages":[{"role":"user","content":"Our standard cap is 12 months fees."}]}'` → streams `chat.completion.chunk` frames ending in `data: [DONE]`.
- [ ] Full voice loop via the tunnel + dashboard agent.
- [ ] Typed fallback path works without voice.

## Swap-out roadmap (post-MVP — seams already in place)

| Placeholder (v1) | Swaps to | Seam |
|---|---|---|
| `lib/gameState.ts` in-memory | **Neo4j** argument graph + path scoring | gameState interface |
| Local = Nemotron via OpenRouter | **on-prem GPU** (true sovereign deployment) | `lib/llm.ts` brain map |
| `data/grounding.ts` GDPR stub | **EU Cellar API** live fetch | `fetchGrounding()` (currently unused) |
| (none) | **Perplexity Sonar** current-topic research | future `research` role |
| synthetic case + placeholder rulebook | lawyer-authored content | `data/*` + `knowledge/*` |

*Cloud/Local model switching already ships via the in-app toggle — see `lib/llm.ts` and `components/EngineToggle.tsx`.*

*All `data/`, `prompts/`, and `knowledge/` content is synthetic placeholder, clearly labelled, and is not legal advice.*
