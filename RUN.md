# The Sparring Room — running the MVP

A voice-first negotiation trainer: a lawyer argues a contract clause out loud against an AI opposing counsel that doesn't fold, then gets a scored, Socratic debrief. This is the v1 vertical slice — Claude-only, synthetic placeholder case content, everything domain/infra-specific built behind clean seams (see `Sparring-Room-MVP-Spec.md` §7 and the plan).

## 1. Add your keys

Edit `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...        # filled in step 3
```

Models are pinned via `MODEL_ADVERSARY=claude-sonnet-4-6` (fast, for the live call) and `MODEL_COACH=claude-opus-4-8` (quality, post-round). Override either via env.

## 2. Test the brain with zero voice cost

```
npm run harness          # typed negotiation in the terminal; /coach to score, /quit to exit
```

Confirm the adversary argues, probes weak points, and doesn't fold to bare confidence; `/coach` returns a structured debrief and the BATNA gate caps the score if you concede uncapped data-breach liability.

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
         shim injects case + GDPR grounding + game-state, calls Claude Sonnet, streams back
End Round -> /api/coach -> Claude Opus (zod structured output) -> debrief card
```

Key files: `prompts/{adversary,coach}.ts`, `data/{case,playbook,grounding,rubric}.ts` (all synthetic placeholders), `lib/{llm,coach,openaiCompat,gameState}.ts`, `app/api/{llm,coach,adversary,elevenlabs/signed-url}/...`, `app/page.tsx`.

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
| coach / adversary = Claude | **NVIDIA Nemotron** (independent judge / Sovereign-Mode on-prem) | `lib/llm.ts` role→model map |
| `data/grounding.ts` GDPR stub | **EU Cellar API** live fetch | `fetchGrounding()` |
| (none) | **Perplexity Sonar** current-topic research | unused `research` role |
| synthetic case/playbook/rubric | lawyer-authored content | `data/*` modules |

*All `data/` and `prompts/` content is synthetic placeholder, clearly labelled, and is not legal advice.*
