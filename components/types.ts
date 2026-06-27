/** Shared UI types for the junior-flow wizard. */

export type Turn = { role: "user" | "adversary"; text: string };

/** How the round is driven: live voice or the typed fallback. */
export type Mode = "voice" | "text";
