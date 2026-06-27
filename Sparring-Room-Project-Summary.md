# The Sparring Room — Project Summary

*Hack the Law 2026 · Legora "Sparring Room" challenge*

## What it is
A voice-first training ground where a lawyer practises real legal work against an AI that fights back — opposing counsel in a negotiation, a partner stress-testing a position, a difficult client — and gets specific, scored coaching after every round. Not an assistant. A sparring partner.

## The challenge it answers
Legora's brief: build an app that lets a lawyer practise under pressure against an AI playing the other side — one that argues, probes weaknesses, and doesn't fold to confidence — then turns coach at the end and shows exactly where they went wrong. The point isn't to supervise an AI; it's to sharpen the lawyer's own judgment by making them use it, repeatedly, against genuine resistance.

## Why now
As AI absorbs the grunt work that used to train junior lawyers, the old learn-by-doing apprenticeship is thinning out — a gap the legal press has spent the last year naming. The provocation behind this build: juniors don't just need a *replacement* for those lost reps. With deliberate practice — well-defined tasks, immediate feedback, unlimited repetition against real resistance — they could learn *better* than the apprenticeship ever taught them. The Sparring Room is the Socratic method finally pointed at the job instead of the textbook.

## How it works
The lawyer steps into one scenario and negotiates out loud against an AI opponent in real time. The AI holds its ground and presses the weak points. When the round ends, it becomes a coach: where you conceded too early, where you missed your leverage, what a stronger move looked like — then you go again to beat your last score.

## What makes it good (not hand-wavy)
- **A real standard to measure against.** Performance is scored against a model playbook grounded in established negotiation theory (Harvard's *Getting to Yes* — BATNA, ZOPA, interests over positions), so "you conceded too early" becomes a concrete, citable judgement, not a vibe.
- **A stateful adversary.** An explicit game-state layer tracks every position and concession, so the AI never forgets what was agreed three turns ago — the thing thin "LLM-with-a-voice" demos get wrong.
- **Specific, Socratic coaching.** The debrief names the single turning point and asks the lawyer to see the better move themselves.

## Tech stack (each tool a distinct, load-bearing layer)
- **ElevenLabs Agents** — real-time voice (ASR + TTS + turn-taking)
- **Anthropic Claude + Claude Code** — the adversary and coach brain; built with Claude Code
- **EU Cellar API** — grounds the scenario's law in real provisions
- **Neo4j** — models the argument as a graph; scoring = the lawyer's path vs the ideal path
- **NVIDIA Nemotron** — open-weight independent scorer, and the on-prem "Sovereign Mode" path for firms whose playbooks can't leave the building

## MVP scope (hackathon)
One arena (negotiation table), one scenario (a contract liability-cap negotiation), voice in and out, an adversary that doesn't fold, and a scored debrief card with a one-click rematch. Everything domain-specific is built as a swappable placeholder, so the lawyers' real scenarios and playbook drop straight in.

## The vision
One polished scenario today → a platform across practice areas and career stages (continuous deliberate practice, not just onboarding) → eventually a way to assess legal judgment by how someone performs under pressure, not by their CV.
