/**
 * data/case.ts — case TYPES (the stable contract).
 *
 * The actual case content + registry live in data/cases.ts. prompts/adversary.ts
 * and prompts/coach.ts import the `Case` type from here; keep these field names
 * when swapping in lawyer-authored content.
 *
 * >>> All case CONTENT is SYNTHETIC PLACEHOLDER — lawyer-authored versions TBD. <<<
 */

export interface Party {
  /** Display name, e.g. "St Aldate's NHS Foundation Trust". */
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

/** A clause the user can choose to argue/defend in a round. */
export interface Clause {
  id: string;
  /** Short label for the selection card. */
  label: string;
  /** One-line summary shown on the collapsed card. */
  description: string;
  /** Expanded fine print / detail shown when the card is opened. */
  details: string;
  /**
   * Trap clause: belongs elsewhere (e.g. the commercial agreement, not the DPA).
   * Not surfaced to the user; the Technician interrogates the choice and the
   * debrief penalises it. See the firm rulebook (knowledge/ playbook §4).
   */
  isTrap?: boolean;
}

export interface Case {
  /** Stable id used in the registry + SessionSetup. */
  id: string;
  /** Display title shown in the case list ("Hospital Data"). */
  title: string;
  /** Short scene-setting briefing read before the round (placeholder text). */
  briefing: string;
  /** Clauses the user can pick to argue (placeholder). */
  clauses: Clause[];
  /** The matter under review, in one or two sentences. */
  issue: string;
  /** The party the human user acts for (shown in the UI). */
  userParty: Party;
  /** The counterparty (shown for context). */
  aiParty?: Party;
  // --- Legacy negotiation fields (optional; the hot seat uses the rulebook). ---
  aiObjectives?: string;
  userInstructions?: UserInstructions;
  zopa?: string;
}

// Back-compat: existing importers of `{ CASE }` from "@/data/case" keep working.
export { CASE, DEFAULT_CASE_ID, CASES, getCase } from "./cases";
