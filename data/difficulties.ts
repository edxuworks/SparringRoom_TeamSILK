/**
 * data/difficulties.ts — opponent difficulty (step 2 of the junior flow).
 *
 * >>> SYNTHETIC PLACEHOLDER — lawyer-authored calibration TBD. <<<
 * `modifier` is appended to the adversary system prompt to tune how readily the
 * opponent concedes. Real calibration (concession thresholds, scoring weighting)
 * will be authored by the lawyers and swapped in here.
 */

export type DifficultyId = "associate" | "partner" | "shark";

export interface Difficulty {
  id: DifficultyId;
  label: string;
  blurb: string;
  /** Appended to the adversary system prompt. PLACEHOLDER wording. */
  modifier: string;
}

export const DIFFICULTIES: Difficulty[] = [
  {
    id: "associate",
    label: "Associate",
    blurb: "Will move to a fair deal if you make sound arguments.",
    modifier:
      "Difficulty: moderate. Reward well-reasoned arguments — move toward a fair deal when the other side uses market standard, fairness, or your weak alternative. (Placeholder calibration.)",
  },
  {
    id: "partner",
    label: "Partner",
    blurb: "Holds firm; concedes only to your strongest points.",
    modifier:
      "Difficulty: hard. Hold firm. Concede only to genuinely strong, well-grounded arguments, and only in small increments. (Placeholder calibration.)",
  },
  {
    id: "shark",
    label: "The Shark",
    blurb: "Relentless. Gives almost nothing.",
    modifier:
      "Difficulty: brutal. Give almost nothing. Press every weakness, exploit any imprecision, and make them earn each inch. (Placeholder calibration.)",
  },
];

export const DEFAULT_DIFFICULTY_ID: DifficultyId = "partner";

export function getDifficulty(id?: string): Difficulty {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}
