/**
 * data/case.ts — the synthetic scenario.
 *
 * >>> SYNTHETIC PLACEHOLDER. Plausible but invented. <<<
 * Replace with a lawyer-authored scenario after the team session.
 * The `Case` type is the stable contract; prompts/adversary.ts and
 * prompts/coach.ts depend on these field names — keep them when swapping content.
 *
 * Scenario: limitation-of-liability clause in a SaaS services agreement.
 *   - TechVendor Ltd (supplier)  = the USER's client.
 *   - ClientCorp plc (customer)  = the AI's client (opposing counsel).
 */

export interface Party {
  /** Display name, e.g. "ClientCorp plc". */
  name: string;
  /** Their commercial role, e.g. "customer" / "supplier". */
  role: string;
}

/** The user's brief: what their client instructed them to achieve. */
export interface UserInstructions {
  target: string;
  acceptable: string;
  /** The walk-away. Crossing this is the "agreement trap". */
  reservationPoint: string;
  leverage: string;
}

export interface Case {
  /** The matter under negotiation, in one or two sentences. */
  issue: string;
  /** The party the AI adversary acts for. */
  aiParty: Party;
  /** The party the human user acts for. */
  userParty: Party;
  /** What the AI is trying to win (ClientCorp's objectives). */
  aiObjectives: string;
  /** The user's hidden brief (only the coach sees this; the adversary must not). */
  userInstructions: UserInstructions;
  /** Zone of possible agreement, plain English. */
  zopa: string;
}

export const CASE: Case = {
  issue:
    "The limitation-of-liability clause in a SaaS services agreement between TechVendor Ltd (supplier) and ClientCorp plc (customer). At stake: the overall liability cap, and whether liability for data-protection breaches is capped or uncapped.",

  aiParty: { name: "ClientCorp plc", role: "customer" },
  userParty: { name: "TechVendor Ltd", role: "supplier" },

  aiObjectives:
    "Win the best deal for ClientCorp: ideally UNCAPPED liability for data-protection breaches (citing the reality of GDPR Article 82 exposure); failing that, a high super-cap (around 3x annual fees) for data breaches; and a general liability cap around 2x annual fees. Invoke regulatory risk, fairness, and 'market standard' to justify pressure.",

  userInstructions: {
    target:
      "Cap ALL liability at 100% of fees paid in the prior 12 months; exclude indirect/consequential loss.",
    acceptable:
      "General cap up to 150% of 12-month fees. A separate data-protection sub-cap of up to 2x annual fees is tolerable if pushed.",
    reservationPoint:
      "NEVER agree to uncapped liability for data breaches, and NO general cap above 150%. (Death/personal injury, fraud and other non-excludable heads are always uncapped — that is standard law, not a concession.)",
    leverage:
      "TechVendor holds ISO 27001 + SOC 2. ClientCorp is 6 months into migration with no easy alternative supplier, so ClientCorp's BATNA is weak — a strong negotiator should use that.",
  },

  zopa:
    "A deal exists roughly between 1x and 2x annual fees WITH a data-breach sub-cap (not uncapped). Agreeing to uncapped data-breach liability is below the user's reservation point — i.e. conceding too early / the agreement trap.",
};
