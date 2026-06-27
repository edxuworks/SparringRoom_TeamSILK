/**
 * data/grounding.ts — legal grounding fact behind a fetch stub.
 *
 * >>> SYNTHETIC PLACEHOLDER -> swaps to a live EU Cellar (publications.europa.eu)
 * SPARQL/REST fetch. <<< The `fetchGrounding()` async signature is the seam:
 * the real Cellar query drops in behind it without touching callers.
 *
 * This makes the adversary's GDPR argument credible in the demo while staying
 * honestly labelled. NOT legal advice.
 *
 * NOTE: currently UNUSED — the live grounding the app relies on is the firm
 * rulebook in knowledge/ (lib/skill.ts). This module is kept as the seam for the
 * future EU Cellar integration; nothing imports it yet.
 */

export interface Grounding {
  /** Citation reference. */
  ref: string;
  /** One-paragraph gist the adversary can weave into argument. */
  gist: string;
  /** Honesty label — surfaced nowhere to the model, just for maintainers. */
  note: string;
}

// PLACEHOLDER. Verify exact citation/wording via EU Cellar before relying on it.
export const GROUNDING: Grounding = {
  ref: "Regulation (EU) 2016/679 (GDPR), Article 82",
  gist: "Gives individuals a right to compensation for material or non-material damage caused by an infringement of the Regulation; controllers and processors can be liable. This is why a customer like ClientCorp argues for uncapped liability on data-protection breaches.",
  note: "SYNTHETIC SUMMARY — replace with verified text fetched from publications.europa.eu (Cellar). Do not present as legal advice.",
};

/**
 * Returns the grounding fact for the current scenario.
 * SWAP: replace the body with a real EU Cellar query (keep the async signature).
 */
export async function fetchGrounding(): Promise<Grounding> {
  return GROUNDING;
}
