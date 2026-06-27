/**
 * data/cases.ts — the case registry.
 *
 * v1 ships the demo case derived from the firm rulebook (DEMO DATA playbook):
 * "Marlin Health Trust v Nemo" — a Data Processing Agreement for processing
 * children's health records through Nemo's AI diagnostics. The junior defends
 * the clauses that structurally protect that data, grilled by "the Technician".
 *
 * IMPORTANT: only user-safe context lives here. The gold-standard answers, what
 * the Technician hunts, the pushback defences, and the scoring all live in the
 * rulebook (lib/skill.ts → DEMO DATA) and are NEVER shown to the user.
 */

import type { Case } from "./case";

const marlinNemo: Case = {
  id: "marlin-nemo-dpa",
  title: "Children's Health Data DPA — Marlin v Nemo",
  briefing:
    "You act for Marlin Health Trust — the UK's largest specialist children's hospital, and the data controller. You're finalising the Data Processing Agreement with Nemo, an AI diagnostics company whose model analyses children's health records to generate treatment recommendations for your clinical staff. This is active AI processing of the most sensitive data category, affecting children's health outcomes — every clause carries direct clinical and legal consequence. Pick the clauses you'll defend, then hold your position in the hot seat.",

  issue:
    "The Data Processing Agreement between Marlin Health Trust (controller) and Nemo (AI diagnostics processor) for processing children's health records as special category data.",

  userParty: { name: "Marlin Health Trust", role: "controller" },
  aiParty: { name: "Nemo", role: "processor" },

  clauses: [
    {
      id: "data-types-purposes",
      label: "Data types & processing purposes",
      description:
        "What data Nemo processes, for exactly what purpose, on what lawful basis.",
      details:
        "Clause 2 (Art 28(3) foundation). Everything downstream flows from how precisely this is drafted: the categories of special category data, the explicit processing purpose, the Article 9(2) basis, and how Nemo's AI processing is characterised. Be ready to say what Nemo's purpose actually is — and whether it's the same as Marlin's.",
    },
    {
      id: "provider-obligations",
      label: "Provider's obligations",
      description:
        "Nemo's core processor duties — including what it may and may not do with the data.",
      details:
        "Clause 3 (the structural backbone). Processing only on documented instructions, data-protection-by-design in the AI system, assistance with Arts 32–36 — and the question of whether Nemo may use Marlin's patient data to retrain its model. Be ready to walk through that analysis.",
    },
    {
      id: "provider-employees",
      label: "Provider's employees",
      description: "Who at Nemo may access the data, and under what controls.",
      details:
        "Clause 4 (Art 28(3)(b)). Authorisation, confidentiality, least-privilege access — and whether technical staff (engineers, data scientists) maintaining the AI are inside the authorisation regime, not just clinical-facing staff.",
    },
    {
      id: "security",
      label: "Security",
      description: "Technical and organisational measures for the data and the model.",
      details:
        "Clause 5 (Art 28(3)(c) + Art 32). Encryption, access control, testing — and AI-specific risks: model integrity, adversarial attacks on diagnostic outputs. Be ready to say whether a manipulated model output is a security failure under your clause.",
    },
    {
      id: "data-breach",
      label: "Personal data breach",
      description: "Breach notification timing and who manages the response.",
      details:
        "Clause 6 (Art 28(3)(f) + Art 33). The processor→controller notification window (and why mirroring the 72-hour ICO deadline is a trap), what a breach means for corrupted AI outputs, and who may communicate externally.",
    },
    {
      id: "warranties",
      label: "Warranties",
      description: "General warranties between the parties.",
      details:
        "A general warranties clause. Consider carefully whether this belongs in the DPA at all, and be ready to justify why you'd put it here.",
      isTrap: true,
    },
  ],
};

export const CASES: Case[] = [marlinNemo];

export const DEFAULT_CASE_ID = marlinNemo.id;

/** Look up a case by id; falls back to the default case. */
export function getCase(id?: string): Case {
  return CASES.find((c) => c.id === id) ?? CASES[0];
}

// Back-compat alias for code that still imports `{ CASE }`.
export const CASE: Case = marlinNemo;
