import { COMPANY_DB, CompanyRecord } from "../data/mock.js";

export interface CompanyLookupArgs {
  company_name: string;
  jurisdiction?: string;
}

export interface CompanyLookupResult {
  found: boolean;
  data?: CompanyRecord;
  fuzzy_matches?: string[];
  message?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

export function companyLookupHandler(args: Record<string, unknown>): {
  content: Array<{ type: "text"; text: string }>;
} {
  const { company_name, jurisdiction } = args as unknown as CompanyLookupArgs;
  const key = normalize(company_name);

  let record = COMPANY_DB[key];

  if (!record) {
    const fuzzy = Object.entries(COMPANY_DB)
      .filter(([k, v]) => {
        const nameMatch = k.includes(key.split(" ")[0]) || key.includes(k.split(" ")[0]);
        const aliasMatch = v.aliases.some((a) => normalize(a).includes(key.split(" ")[0]));
        return nameMatch || aliasMatch;
      })
      .map(([, v]) => v.name);

    if (fuzzy.length > 0) {
      const result: CompanyLookupResult = {
        found: false,
        fuzzy_matches: fuzzy,
        message: `Exact match not found. Possible matches: ${fuzzy.join(", ")}`,
      };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ found: false, message: "No matching company found." }, null, 2),
        },
      ],
    };
  }

  if (jurisdiction && record.jurisdiction !== jurisdiction.toUpperCase()) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              found: false,
              message: `Company found but jurisdiction mismatch: expected ${jurisdiction}, got ${record.jurisdiction}`,
              partial_data: { name: record.name, actual_jurisdiction: record.jurisdiction },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const result: CompanyLookupResult = { found: true, data: record };
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
