/**
 * lib/research.ts — external authority cascade for the coach ("amend the skill").
 *
 * When the debrief raises a legal point the firm RULEBOOK doesn't cover, the coach
 * (Claude) calls the `look_up_authority` tool; we resolve it through a cascade:
 *
 *   1. EU Cellar (Publications Office) — deterministic CELEX -> verified EU
 *      citation + official resource URL, enriched by a best-effort SPARQL title
 *      fetch. Fast and real (no key). https://op.europa.eu / publications.europa.eu
 *   2. Perplexity Sonar — grounded web research, behind PERPLEXITY_API_KEY. Skipped
 *      gracefully when the key is absent.
 *   3. Nothing found -> the model is told to fall back to the firm rulebook.
 *
 * Everything returned is wrapped (formatAuthorityForModel) with an instruction to
 * RECONCILE with the firm's rules before relying on it — so external knowledge is
 * still grounded by the skill/rulebook, never presented over it.
 */

export interface Authority {
  /** Citation reference (instrument + CELEX, or source). */
  ref: string;
  /** Short substantive gist the coach can weave in. */
  gist: string;
  source: "cellar" | "perplexity";
  /** Official/canonical URL where available. */
  url?: string;
}

const CELLAR_SPARQL = "https://publications.europa.eu/webapi/rdf/sparql";

/**
 * Keyword -> EU instrument (CELEX) map, focused on the data-protection domain the
 * cases live in. A match yields a verified citation without a slow full-text
 * SPARQL scan; a miss cascades to Perplexity.
 */
const CELEX_MAP: { test: RegExp; celex: string; title: string }[] = [
  {
    test: /\bgdpr\b|2016\/679|data protection|personal data|art(icle)?\s*(5|6|7|9|13|14|22|24|25|28|30|32|33|34|35|44|46|82|83)\b|controller|processor|sub-?processor|breach notification|special categor|children'?s? data|international transfer/i,
    celex: "32016R0679",
    title: "Regulation (EU) 2016/679 (General Data Protection Regulation)",
  },
  {
    test: /e-?privacy|2002\/58|cookies?|electronic communications|traffic data/i,
    celex: "32002L0058",
    title: "Directive 2002/58/EC (ePrivacy Directive)",
  },
  {
    test: /\bai act\b|artificial intelligence|2024\/1689|high-?risk ai|automated decision/i,
    celex: "32024R1689",
    title: "Regulation (EU) 2024/1689 (Artificial Intelligence Act)",
  },
  {
    test: /\bnis ?2\b|2022\/2555|network and information security/i,
    celex: "32022L2555",
    title: "Directive (EU) 2022/2555 (NIS2 Directive)",
  },
  {
    test: /\bdata act\b|2023\/2854/i,
    celex: "32023R2854",
    title: "Regulation (EU) 2023/2854 (Data Act)",
  },
  {
    test: /data governance|2022\/868|\bdga\b/i,
    celex: "32022R0868",
    title: "Regulation (EU) 2022/868 (Data Governance Act)",
  },
];

/** Race a promise against a timeout, resolving null on timeout/error. */
async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Best-effort: fetch the official English title for a CELEX from the Cellar SPARQL endpoint. */
async function cellarTitle(celex: string): Promise<string | null> {
  const sparql = `PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
SELECT ?title WHERE {
  ?work cdm:resource_legal_id_celex ?celex .
  FILTER(STR(?celex) = "${celex}")
  ?exp cdm:expression_belongs_to_work ?work ;
       cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> ;
       cdm:expression_title ?title .
} LIMIT 1`;
  const url = `${CELLAR_SPARQL}?query=${encodeURIComponent(sparql)}&format=application/sparql-results+json`;
  const res = await withTimeout(
    fetch(url, { headers: { Accept: "application/sparql-results+json" } }).then((r) =>
      r.ok ? r.json() : null,
    ),
    8_000,
  );
  const title = res?.results?.bindings?.[0]?.title?.value;
  return typeof title === "string" && title.length > 0 ? title : null;
}

/** Tier 1: deterministic CELEX citation (+ best-effort verified title) from EU Cellar. */
async function queryCellar(query: string): Promise<Authority | null> {
  const hit = CELEX_MAP.find((m) => m.test.test(query));
  if (!hit) return null;
  const url = `http://publications.europa.eu/resource/celex/${hit.celex}`;
  const verified = await cellarTitle(hit.celex);
  const title = verified ?? hit.title;
  return {
    ref: `${title} [CELEX ${hit.celex}]`,
    gist: `Verified EU instrument via the Publications Office (Cellar). Official source: ${url}`,
    source: "cellar",
    url,
  };
}

/** Tier 2: Perplexity Sonar, grounded by a rules system prompt. Null if no key. */
async function queryPerplexity(query: string): Promise<Authority | null> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return null;

  const body = {
    model: process.env.MODEL_PERPLEXITY || "sonar",
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You are a legal-research assistant for EU/UK data-protection law. Answer ONLY with verified legal grounding relevant to the question, naming the specific regulation and article. Be concise (max 3 sentences). If you are not confident it is accurate, say so explicitly. Do not give legal advice or opinions.",
      },
      { role: "user", content: query },
    ],
  };

  const res = await withTimeout(
    fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((r) => (r.ok ? r.json() : null)),
    12_000,
  );

  const content: string | undefined = res?.choices?.[0]?.message?.content;
  if (!content) return null;
  const citation: string | undefined = res?.citations?.[0];
  return {
    ref: citation ? `Perplexity (Sonar) — ${citation}` : "Perplexity (Sonar) web research",
    gist: content.trim(),
    source: "perplexity",
    url: citation,
  };
}

/** Run the cascade: EU Cellar -> Perplexity -> null. */
export async function lookupAuthority(query: string): Promise<Authority | null> {
  return (await queryCellar(query)) ?? (await queryPerplexity(query));
}

/**
 * Wrap the authority for the model: a reconcile-with-the-firm-rules instruction so
 * external knowledge is grounded by the skill/rulebook, never asserted over it.
 */
export function formatAuthorityForModel(
  query: string,
  authority: Authority | null,
): string {
  if (!authority) {
    return `No external authority found for "${query}". Do NOT invent law — rely on the firm rulebook and flag the point as outside the playbook.`;
  }
  return [
    `EXTERNAL AUTHORITY (source: ${authority.source}). Reconcile with the firm rulebook above before relying on it; do not state anything that conflicts with the firm's skill.`,
    `Citation: ${authority.ref}`,
    authority.url ? `URL: ${authority.url}` : "",
    `Summary: ${authority.gist}`,
  ]
    .filter(Boolean)
    .join("\n");
}
