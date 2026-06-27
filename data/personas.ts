/**
 * data/personas.ts — opponent personalities (step 2 of the junior flow).
 *
 * >>> SYNTHETIC PLACEHOLDER — lawyer-authored personalities TBD. <<<
 * `systemPromptModifier` is appended to the adversary system prompt (any brain),
 * so the swap to real content is local. `image` is the pixel-art avatar served
 * from /public; `avatar` (emoji) is kept as a fallback.
 */

export type PersonaId = "opposing_counsel" | "stonewaller" | "charmer";

export interface Persona {
  id: PersonaId;
  label: string;
  /** Short blurb shown on the selection card. */
  blurb: string;
  /** Emoji avatar, kept as fallback. */
  avatar: string;
  /** Pixel-art avatar path under /public. */
  image: string;
  /** Appended to the adversary system prompt. PLACEHOLDER wording. */
  systemPromptModifier: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "opposing_counsel",
    label: "Opposing Counsel",
    blurb: "Measured, dry authority. The default.",
    avatar: "⚖️",
    image: "/images/opponents/opposing_counsel.png",
    systemPromptModifier:
      "Speak with measured authority — unhurried and precise, especially under pressure. Professional, not warm. Concede only to genuinely strong arguments, and only incrementally. (Placeholder persona.)",
  },
  {
    id: "stonewaller",
    label: "The Stonewaller",
    blurb: "Minimal concessions, very short, impassive.",
    avatar: "🧱",
    image: "/images/opponents/stonewaller.png",
    systemPromptModifier:
      "Give very short responses — one or two sentences. Volunteer nothing. Concede nothing without a specific, well-grounded reason. Flat, neutral tone. (Placeholder persona.)",
  },
  {
    id: "charmer",
    label: "The Charmer",
    blurb: "Warm and reasonable-sounding — still doesn't move.",
    avatar: "😊",
    image: "/images/opponents/charmer.png",
    systemPromptModifier:
      "Sound warm, collaborative, and reasonable at all times, but do not actually move on core positions. Reframe every refusal as understanding ('I hear you, but...'). Make them feel heard while getting nothing. (Placeholder persona.)",
  },
];

export const DEFAULT_PERSONA_ID: PersonaId = "opposing_counsel";

export function getPersona(id?: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
