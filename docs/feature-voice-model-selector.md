# Feature: Voice Model Selector (ElevenLabs vs Nemotron VoiceChat)

## What to build

Add a **pre-session model selector** to the home page — a dropdown (or toggle group) that
lets the user choose their voice backend before starting a round. For now: two options,
ElevenLabs Agents and NVIDIA Nemotron VoiceChat. This is a developer/experimentation
feature for the hackathon; the architecture should make it trivially extensible to more
models and eventually personality presets.

Do NOT change any existing adversary logic, game state, coach, or debrief code.
This feature is purely about swapping the voice layer before a session starts.

---

## 1. UI change — home/lobby screen

On the pre-session screen (before the user clicks "Start Round"), add a selector component:

```
┌─────────────────────────────────────────────┐
│  Voice Model                                │
│  ┌─────────────────────────────────────┐    │
│  │  🎙 ElevenLabs Agents          ▾   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Persona                                    │
│  ┌─────────────────────────────────────┐    │
│  │  Opposing Counsel (default)    ▾   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│         [ Start Round ]                     │
└─────────────────────────────────────────────┘
```

**Voice Model options (v1):**
- `elevenlabs` — ElevenLabs Agents (default, current implementation)
- `nemotron` — NVIDIA Nemotron VoiceChat (full-duplex speech-to-speech)

**Persona options (v1, same for both models):**
- `opposing_counsel` — Senior associate, City firm, measured/dry (default)
- `stonewaller` — Minimal concessions, very short responses, impassive
- `charmer` — Warm and reasonable-sounding on the surface, still doesn't move

Persona selection is wired into the system prompt / PersonaPlex prompt; it is NOT model-
specific in v1 (same personas available regardless of voice model). This allows future
mixing and matching.

Show a small badge or note under the selector when `nemotron` is selected:
```
⚡ Full-duplex · NVIDIA NIM endpoint · Early access
```

And when `elevenlabs` is selected:
```
✓ Low-latency agents · ElevenLabs Conversational AI
```

---

## 2. State — `SessionConfig`

Create a type (in `lib/types.ts` or alongside `gameState.ts`) that captures pre-session
choices and is passed into the session:

```ts
export type VoiceModel = "elevenlabs" | "nemotron";

export type PersonaId = "opposing_counsel" | "stonewaller" | "charmer";

export interface SessionConfig {
  voiceModel: VoiceModel;
  personaId: PersonaId;
}
```

Pass `SessionConfig` as a prop/context from the lobby into the call screen component.
The call screen then routes to the correct voice handler based on `voiceModel`.

---

## 3. Voice handler abstraction — `lib/voice/`

Create a thin abstraction so the call screen doesn't need to know which model it's using:

```
lib/voice/
  index.ts          — exports useVoiceSession hook (routes by voiceModel)
  elevenlabs.ts     — wraps existing ElevenLabs @elevenlabs/react session logic
  nemotron.ts       — wraps Nemotron VoiceChat WebSocket/WebRTC session logic
  types.ts          — shared VoiceSession interface (see below)
```

**Shared interface (`lib/voice/types.ts`):**
```ts
export interface VoiceSession {
  /** Call to start the voice session (after mic permission granted) */
  start: () => Promise<void>;
  /** Call to end the session and get the transcript */
  stop: () => Promise<Transcript>;
  /** Live status for UI display */
  status: "idle" | "listening" | "speaking" | "error";
  /** Running transcript for live display */
  liveTranscript: TranscriptTurn[];
}
```

The call screen uses `useVoiceSession(config)` — it never imports `elevenlabs.ts` or
`nemotron.ts` directly.

**`lib/voice/index.ts`:**
```ts
import { useElevenLabsSession } from "./elevenlabs";
import { useNemotronSession } from "./nemotron";
import type { SessionConfig } from "../types";

export function useVoiceSession(config: SessionConfig): VoiceSession {
  if (config.voiceModel === "nemotron") return useNemotronSession(config);
  return useElevenLabsSession(config);  // default
}
```

---

## 4. ElevenLabs handler — `lib/voice/elevenlabs.ts`

Move the existing ElevenLabs session logic (signed-URL fetch + `@elevenlabs/react`
`useConversation` hook) into this file. No logic changes — just relocate into the
abstraction. Export as `useElevenLabsSession(config: SessionConfig): VoiceSession`.

---

## 5. Nemotron handler — `lib/voice/nemotron.ts`

Nemotron VoiceChat is a **full-duplex speech-to-speech model** — it takes audio in and
streams audio out in one unified model, no separate ASR/LLM/TTS steps. The NIM endpoint
is at `build.nvidia.com`. Check the current API docs at:
`https://build.nvidia.com/nvidia/nemotron-voicechat`
for the exact WebSocket / streaming audio endpoint and auth method (uses
`NVIDIA_API_KEY` — already in `.env.local`).

Key implementation notes:
- Nemotron VoiceChat accepts a **text role prompt** (via NVIDIA PersonaPlex) for persona
  control — this is how you control voice character, NOT via separate voice settings.
  Pass the persona prompt (see §6) as the system/role input.
- Because it is full-duplex and end-to-end, it does NOT call `/api/llm` (your custom-LLM
  shim for ElevenLabs → Claude). The model handles understanding + generation internally.
  This means Nemotron VoiceChat does NOT use the game-state injection from your shim in v1.
  Mark this clearly in a comment: `// TODO: game-state injection not yet wired for Nemotron`
- For v1, wire up basic audio in/out and confirm the voice works. Game-state and scoring
  still run at end-of-round via `/api/coach` using the transcript, same as ElevenLabs.
- Capture the transcript from Nemotron's output stream (it returns user speech
  transcription alongside agent audio per the model card).
- Export as `useNemotronSession(config: SessionConfig): VoiceSession`.

---

## 6. Persona prompts — `data/personas.ts`

Create a persona registry that both voice handlers can pull from:

```ts
export interface Persona {
  id: PersonaId;
  label: string;
  description: string;           // shown in UI tooltip/badge
  /** Used by ElevenLabs: injected into adversary system prompt via /api/llm shim */
  systemPromptModifier: string;
  /** Used by Nemotron: passed as the PersonaPlex role/text prompt */
  personaPlexPrompt: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  opposing_counsel: {
    id: "opposing_counsel",
    label: "Opposing Counsel",
    description: "Senior associate, measured, dry authority",
    systemPromptModifier: `
      Speak with measured authority. Unhurried and precise — especially under pressure.
      Professional, not warm. Concede only to genuinely strong arguments, incrementally.
      When pressed hard, become more exact and slower, never more heated.
    `,
    personaPlexPrompt: `
      You are a senior associate solicitor at a major City law firm.
      Speak with measured, dry authority. Unhurried, precise, professional.
      RP British accent. You are firm but not aggressive.
      When the other side pushes hard, you slow down and get more exact — never heated.
      You concede ground only to strong, well-reasoned arguments, and only incrementally.
    `,
  },
  stonewaller: {
    id: "stonewaller",
    label: "The Stonewaller",
    description: "Minimal concessions, very short, impassive",
    systemPromptModifier: `
      Give very short responses — 1 to 2 sentences maximum. Refuse to move on any point
      without an extremely compelling, specific argument. Show no warmth. Offer nothing
      voluntarily. Make the user drag every concession out.
    `,
    personaPlexPrompt: `
      You are an impassive, stonewalling negotiator. Very short responses only — one or
      two sentences. You volunteer nothing. You concede nothing without being given a
      specific, well-grounded reason. Flat, neutral tone throughout.
    `,
  },
  charmer: {
    id: "charmer",
    label: "The Charmer",
    description: "Warm and reasonable-sounding, still doesn't move",
    systemPromptModifier: `
      Sound warm, collaborative, and reasonable at all times — but do not actually move
      on your core positions. Frame every refusal as "I understand your concern, but..."
      Make the user feel heard while getting nothing. The danger is they mistake warmth
      for flexibility.
    `,
    personaPlexPrompt: `
      You are a charming, warm negotiator who sounds collaborative and reasonable at all
      times. You never sound confrontational. You acknowledge the other side generously.
      But you do not actually concede your core positions — you simply reframe your
      refusals as understanding. Friendly, engaging tone throughout.
    `,
  },
};
```

---

## 7. Wire persona into the ElevenLabs shim

In `/api/llm/route.ts`, read the `personaId` from the session (pass it via a custom
header or the agent's metadata/conversation context). Look up `PERSONAS[personaId].systemPromptModifier`
and append it to the adversary system prompt assembled in `adversarySystemPrompt(...)`.

---

## 8. Environment variables — add to `.env.local`

```
# Already present:
NVIDIA_API_KEY=...

# Add:
NEXT_PUBLIC_ENABLE_NEMOTRON=true   # feature flag — set false to hide the option in prod
```

Use `NEXT_PUBLIC_ENABLE_NEMOTRON` to conditionally render the Nemotron option in the
selector — makes it easy to hide for a polished demo if the integration isn't fully stable.

---

## 9. Files to create / modify (summary)

**Create:**
```
lib/types.ts                    — SessionConfig, VoiceModel, PersonaId types
lib/voice/types.ts              — VoiceSession interface
lib/voice/index.ts              — useVoiceSession router hook
lib/voice/elevenlabs.ts         — relocated ElevenLabs session logic
lib/voice/nemotron.ts           — Nemotron VoiceChat session logic (new)
data/personas.ts                — Persona registry
```

**Modify:**
```
app/page.tsx                    — add model + persona selectors in lobby view;
                                  pass SessionConfig into call screen
lib/voice/ (call screen)        — swap direct ElevenLabs calls for useVoiceSession(config)
api/llm/route.ts                — read personaId, append systemPromptModifier
```

**Do NOT modify:**
```
lib/gameState.ts
api/coach/route.ts
prompts/adversary.ts            — template unchanged; modifier appended at runtime
prompts/coach.ts
data/case.ts / playbook.ts / rubric.ts / grounding.ts
```

---

## 10. Known limitations to comment clearly in code

1. `// Nemotron: game-state injection not wired (v1). Adversary logic is fully internal to the model.`
2. `// Nemotron: persona control is via PersonaPlex text prompt only — no voice-settings sliders.`
3. `// ElevenLabs: persona modifier injected server-side via /api/llm shim.`
4. `// NEXT_PUBLIC_ENABLE_NEMOTRON=false to hide Nemotron option in demo mode.`

---

## Success criteria for this feature

- [ ] Lobby shows Voice Model dropdown (ElevenLabs / Nemotron) + Persona dropdown
- [ ] Selecting ElevenLabs and starting a round behaves exactly as before
- [ ] Selecting Nemotron and starting a round initiates a Nemotron VoiceChat session
      with the correct PersonaPlex prompt for the chosen persona
- [ ] Changing persona with ElevenLabs changes the adversary's speaking style in-round
- [ ] Debrief/coach works identically regardless of which voice model was used
- [ ] `NEXT_PUBLIC_ENABLE_NEMOTRON=false` hides Nemotron from the selector entirely
