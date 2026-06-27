/**
 * data/playbook.ts — the model answer ("good" looks like this).
 *
 * >>> SYNTHETIC PLACEHOLDER. <<< Replace with the lawyers' real playbook +
 * gold answers after the team session. The `Playbook` type is the stable
 * contract consumed by prompts/coach.ts.
 *
 * Grounded in Fisher, Ury & Patton, *Getting to Yes* / Harvard Program on
 * Negotiation (BATNA, ZOPA, interests over positions, objective criteria).
 */

export interface Playbook {
  /** The strong path, in order. */
  idealPath: string[];
  /** Junior mistakes the coach should look for. */
  commonMistakes: string[];
}

export const PLAYBOOK: Playbook = {
  idealPath: [
    "Anchor low, with justification — open at the 12-month cap and frame it as proportionate and market-standard, not arbitrary.",
    "Probe the real interest — surface that ClientCorp's true concern is data-breach / regulatory exposure, not liability in general. Separate that issue from the general cap so the scary scenario doesn't inflate the whole number.",
    "Trade, don't cave — offer a data-protection sub-cap (e.g. 2x) and/or a security-audit right in exchange for keeping the general cap low. Invent options instead of haggling one number.",
    "Use objective criteria — market-standard caps; the point that truly uncapped liability is uninsurable and would simply be priced back into the fees (legitimacy, not just assertion).",
    "Hold the reservation point — never concede uncapped data-breach liability; if pressed hard, lean on ClientCorp's weak alternative (their migration sunk cost) rather than folding.",
    "Ideal landing — general cap ~1.5x, data-protection sub-cap ~2x with carve-back, non-excludables uncapped.",
  ],
  commonMistakes: [
    "Conceding uncapped data-breach liability under GDPR pressure (the trap).",
    "Negotiating only the number while ignoring the underlying interests.",
    "Over-anchoring then caving fast (credibility loss).",
    "Forgetting their own leverage (ClientCorp's weak BATNA, TechVendor's certifications).",
  ],
};
