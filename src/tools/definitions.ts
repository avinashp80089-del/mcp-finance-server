import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS: Tool[] = [
  {
    name: "company_lookup",
    description:
      "Look up company registration data, beneficial ownership, jurisdiction, and business details. Returns structured KYB data.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "Full or partial company name" },
        jurisdiction: { type: "string", description: "ISO 3166-1 alpha-2 country code (e.g. US, GB, VG)" },
      },
      required: ["company_name"],
    },
  },
  {
    name: "risk_score",
    description:
      "Calculate a composite AML/KYB risk score (0–100) for an entity based on jurisdiction, industry, ownership structure, and PEP exposure.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        jurisdiction: { type: "string", description: "ISO 3166-1 alpha-2 country code" },
        industry: { type: "string", description: "Industry sector (e.g. Technology, Trading, Financial Services)" },
        ownership_complexity: {
          type: "string",
          enum: ["simple", "layered", "opaque"],
          description: "Complexity of the UBO/ownership chain",
        },
        pep_involved: { type: "boolean", description: "Whether a Politically Exposed Person is in the ownership chain" },
        revenue_usd: { type: "number", description: "Annual revenue in USD" },
      },
      required: ["company_name", "jurisdiction", "industry"],
    },
  },
  {
    name: "sanctions_check",
    description:
      "Screen an individual or entity name against OFAC SDN, UN Security Council, EU Consolidated, and UK OFSI sanctions lists. Returns exact and fuzzy matches.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name to screen" },
        entity_type: { type: "string", enum: ["individual", "company"] },
        jurisdiction: { type: "string" },
        fuzzy_threshold: {
          type: "number",
          description: "Jaccard similarity threshold for fuzzy matching (0–1, default 0.75)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "doc_summary",
    description:
      "Extract a structured summary, risk flags, entities, amounts, and dates from a financial document (bank statement, invoice, corporate registry, contract).",
    inputSchema: {
      type: "object",
      properties: {
        document_text: { type: "string", description: "Raw text content of the document" },
        doc_type: {
          type: "string",
          enum: ["bank_statement", "corporate_registry", "invoice", "contract", "other"],
        },
        extract_entities: {
          type: "boolean",
          description: "Whether to extract monetary amounts, dates, and organization names",
        },
      },
      required: ["document_text"],
    },
  },
];
