import { SANCTIONS_LISTS } from "../data/mock.js";

export interface SanctionsCheckArgs {
  name: string;
  entity_type?: "individual" | "company";
  jurisdiction?: string;
  fuzzy_threshold?: number;
}

interface SanctionsMatch {
  matched_name: string;
  list: string;
  match_type: "exact" | "fuzzy";
  similarity?: number;
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

export function sanctionsCheckHandler(args: Record<string, unknown>): {
  content: Array<{ type: "text"; text: string }>;
} {
  const {
    name,
    entity_type = "company",
    fuzzy_threshold = 0.75,
  } = args as unknown as SanctionsCheckArgs;

  const exact_matches: SanctionsMatch[] = [];
  const fuzzy_matches: SanctionsMatch[] = [];

  for (const [list, entries] of Object.entries(SANCTIONS_LISTS)) {
    for (const entry of entries) {
      if (entry.toLowerCase() === name.toLowerCase()) {
        exact_matches.push({ matched_name: entry, list, match_type: "exact" });
      } else {
        const sim = jaccardSimilarity(name, entry);
        if (sim >= fuzzy_threshold) {
          fuzzy_matches.push({ matched_name: entry, list, match_type: "fuzzy", similarity: sim });
        }
      }
    }
  }

  const status =
    exact_matches.length > 0
      ? "MATCH"
      : fuzzy_matches.length > 0
      ? "POSSIBLE_MATCH"
      : "CLEAR";

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            query: name,
            entity_type,
            status,
            checked_lists: Object.keys(SANCTIONS_LISTS),
            exact_matches,
            fuzzy_matches,
            action_required: status !== "CLEAR",
            checked_at: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}
