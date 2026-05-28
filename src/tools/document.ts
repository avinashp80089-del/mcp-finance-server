export interface DocSummaryArgs {
  document_text: string;
  doc_type?: "bank_statement" | "corporate_registry" | "invoice" | "contract" | "other";
  extract_entities?: boolean;
}

const RISK_KEYWORDS = [
  "shell company",
  "bearer shares",
  "nominee director",
  "offshore",
  "undisclosed",
  "anonymous",
  "tax haven",
  "beneficial owner not identified",
  "cash transaction",
  "structuring",
  "layering",
  "placement",
];

const AMOUNT_REGEX = /\$[\d,]+(?:\.\d{2})?|\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP|million|billion)/gi;
const DATE_REGEX = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi;
const ORG_REGEX = /\b[A-Z][a-z]+ (?:Corp|Inc|LLC|Ltd|SA|GmbH|Holding|Group|Partners|Capital|Bank|Trust|Fund)\b/g;

export function docSummaryHandler(args: Record<string, unknown>): {
  content: Array<{ type: "text"; text: string }>;
} {
  const {
    document_text,
    doc_type = "other",
    extract_entities = true,
  } = args as unknown as DocSummaryArgs;

  const text = document_text.trim();
  const wordCount = text.split(/\s+/).length;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const summary =
    sentences.slice(0, 3).map((s) => s.trim()).join(". ") +
    (sentences.length > 3 ? "..." : "");

  const risk_flags = RISK_KEYWORDS.filter((kw) =>
    text.toLowerCase().includes(kw.toLowerCase())
  );

  const result: Record<string, unknown> = {
    doc_type,
    word_count: wordCount,
    summary: summary || text.slice(0, 300),
    risk_flags,
    risk_flag_count: risk_flags.length,
    risk_level: risk_flags.length === 0 ? "low" : risk_flags.length <= 2 ? "medium" : "high",
  };

  if (extract_entities) {
    result["extracted_amounts"] = [...new Set(text.match(AMOUNT_REGEX) ?? [])];
    result["extracted_dates"] = [...new Set(text.match(DATE_REGEX) ?? [])];
    result["extracted_organizations"] = [...new Set(text.match(ORG_REGEX) ?? [])];
  }

  result["processed_at"] = new Date().toISOString();

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
