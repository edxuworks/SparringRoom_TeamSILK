/**
 * lib/gameState.ts — PLACEHOLDER game-state store.
 *
 * v1 is intentionally minimal: ElevenLabs sends the full message history on
 * every turn, so the shim is effectively stateless per turn. We only track a
 * turn count for the adversary prompt's "current state" line. The heavy
 * analysis happens once, at coach time, from the client-captured transcript.
 *
 * SWAP point: model this as a Neo4j argument graph (positions / concessions /
 * moves + the playbook's ideal path) so scoring becomes path-vs-optimal and
 * "replay the turning point" falls out for free. Do NOT build that now — keep
 * this Map-backed shim behind the same interface.
 */

export interface GameState {
  sessionId: string;
  turnCount: number;
}

const store = new Map<string, GameState>();

/** Get (or create) state for a session/conversation key. */
export function getState(sessionId: string): GameState {
  let s = store.get(sessionId);
  if (!s) {
    s = { sessionId, turnCount: 0 };
    store.set(sessionId, s);
  }
  return s;
}

/** Record that the user just took a turn; returns the updated state. */
export function bumpTurn(sessionId: string): GameState {
  const s = getState(sessionId);
  s.turnCount += 1;
  return s;
}

/** A one/two-line description of where the negotiation stands, for the prompt. */
export function summarize(s: GameState): string {
  if (s.turnCount <= 0) return "The negotiation is just beginning.";
  return `Turn ${s.turnCount}. Keep in mind what has already been proposed, agreed, or contested in the exchange above; do not forget earlier concessions.`;
}
