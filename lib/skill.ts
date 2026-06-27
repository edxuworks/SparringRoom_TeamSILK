/**
 * lib/skill.ts — loads the firm rulebook + skills from the knowledge/ folder.
 *
 * This is the source of truth for how the AI questions and grades. Files are
 * read once at module init (server-side) and held for the process lifetime —
 * effectively cached, no runtime document parsing. A lawyer edits the files
 * (or drops new skills into knowledge/) and the app picks them up on next boot.
 *
 *   SKILL.md                    — the Hot Seat method (questioning + debrief)
 *   dp-contract-checklist.md    — legal reference (Art 28(3) etc.)
 *   DigDeeper_..._Playbook.md   — the firm rulebook (scenario, gold standards,
 *                                 Technician questions, pushback, traps, scoring)
 *
 * Any other *.md dropped into knowledge/ is appended automatically (see
 * extraSkills) — keep non-rulebook material (e.g. the voice-agent prompt) OUT
 * of this folder so it doesn't bloat the cached rulebook.
 *
 * NODE RUNTIME ONLY (uses fs). Imported by lib/setup.ts and lib/coach.ts, both
 * on `runtime = "nodejs"` routes.
 */

import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const PLAYBOOK_FILE = "DigDeeper_GoldStandard_Playbook_v2.md";
const CHECKLIST_FILE = "dp-contract-checklist.md";
const SKILL_FILE = "SKILL.md";

function read(file: string, ...dirs: string[]): string {
  for (const dir of dirs) {
    try {
      return fs.readFileSync(path.join(dir, file), "utf8");
    } catch {
      /* try next */
    }
  }
  return "";
}

/** Strip leading YAML frontmatter (--- ... ---). */
function stripFrontmatter(md: string): string {
  return md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

export const SKILL_MD = stripFrontmatter(read(SKILL_FILE, KNOWLEDGE_DIR));
export const CHECKLIST_MD = read(CHECKLIST_FILE, KNOWLEDGE_DIR).trim();
export const PLAYBOOK_MD = read(PLAYBOOK_FILE, KNOWLEDGE_DIR).trim();

/**
 * Any *other* .md files dropped into knowledge/ (future skills for
 * evaluation/grading/questioning) are appended automatically.
 */
function extraSkills(): string {
  let dir: string[];
  try {
    dir = fs.readdirSync(KNOWLEDGE_DIR);
  } catch {
    return "";
  }
  const known = new Set([PLAYBOOK_FILE, CHECKLIST_FILE, SKILL_FILE]);
  return dir
    .filter((f) => f.endsWith(".md") && !known.has(f))
    .map((f) => stripFrontmatter(read(f, KNOWLEDGE_DIR)))
    .filter(Boolean)
    .join("\n\n");
}

const EXTRA = extraSkills();

/**
 * The full rulebook injected into the hot-seat and grading prompts:
 * method (skill) + legal reference + firm playbook (+ any extra skills).
 * Large and identical every turn → ideal for prompt caching (see lib/llm.ts).
 */
export const RULEBOOK = [
  "# SKILL — METHOD\n" + SKILL_MD,
  CHECKLIST_MD && "# LEGAL REFERENCE — DP CONTRACT CHECKLIST\n" + CHECKLIST_MD,
  PLAYBOOK_MD && "# FIRM RULEBOOK — GOLD STANDARD PLAYBOOK\n" + PLAYBOOK_MD,
  EXTRA && "# ADDITIONAL SKILLS\n" + EXTRA,
]
  .filter(Boolean)
  .join("\n\n---\n\n");
