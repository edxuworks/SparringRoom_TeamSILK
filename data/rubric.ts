/**
 * data/rubric.ts — the evaluation metric.
 *
 * >>> SYNTHETIC PLACEHOLDER (research-based weights — tune with the lawyers). <<<
 * The `Rubric` type is the stable contract consumed by prompts/coach.ts.
 *
 * Grounded in Fisher, Ury & Patton, *Getting to Yes* / Harvard Program on
 * Negotiation. Six dimensions scored 0-5; overall = weighted average x BATNA gate.
 */

export interface RubricDimension {
  name: string;
  /** Fraction of the overall score (weights sum to 1). */
  weight: number;
  description: string;
}

export interface RubricGate {
  name: string;
  description: string;
  /** Overall score is capped at this value if the gate is crossed. */
  cappedScore: number;
}

export interface Rubric {
  dimensions: RubricDimension[];
  gate: RubricGate;
}

export const RUBRIC: Rubric = {
  dimensions: [
    {
      name: "BATNA discipline",
      weight: 0.3,
      description:
        "Did they stay above their reservation point — never conceding uncapped data-breach liability or a cap above 150%?",
    },
    {
      name: "Anchoring & positioning",
      weight: 0.15,
      description:
        "Did they open strongly and hold a credible anchor, vs accepting the other side's frame?",
    },
    {
      name: "Interests over positions",
      weight: 0.2,
      description:
        "Did they surface ClientCorp's real interest (data-breach/regulatory risk) and address that, vs only haggling a number?",
    },
    {
      name: "Objective criteria / legitimacy",
      weight: 0.1,
      description:
        "Did they justify with market standard, insurability, GDPR reality — vs bare assertion?",
    },
    {
      name: "Value creation",
      weight: 0.15,
      description:
        "Did they invent options (sub-cap, audit right, trade-offs) rather than pure win-lose haggling?",
    },
    {
      name: "Composure under pressure",
      weight: 0.1,
      description:
        "Did they hold position when pushed, without folding or overplaying a weak hand?",
    },
  ],
  gate: {
    name: "BATNA gate",
    description:
      "If the lawyer crossed their reservation point (conceded uncapped data-breach liability, or a general cap above 150%), the round cannot score well — you cannot score well on a deal worse than your own walk-away. This operationalises 'conceded too early'.",
    cappedScore: 40,
  },
};
