import { describe, it, expect } from "vitest";
import { companyLookupHandler } from "../src/tools/company.js";
import { riskScoreHandler } from "../src/tools/risk.js";
import { sanctionsCheckHandler } from "../src/tools/sanctions.js";
import { docSummaryHandler } from "../src/tools/document.js";

describe("company_lookup", () => {
  it("returns found=true for known company", () => {
    const result = companyLookupHandler({ company_name: "Acme Corp" });
    const data = JSON.parse(result.content[0].text);
    expect(data.found).toBe(true);
    expect(data.data.name).toBe("Acme Corp");
  });

  it("returns fuzzy matches for partial name", () => {
    const result = companyLookupHandler({ company_name: "Meridian" });
    const data = JSON.parse(result.content[0].text);
    expect(data.fuzzy_matches).toBeDefined();
    expect(data.fuzzy_matches.length).toBeGreaterThan(0);
  });

  it("returns found=false with message for unknown company", () => {
    const result = companyLookupHandler({ company_name: "Nonexistent XYZ Corp 12345" });
    const data = JSON.parse(result.content[0].text);
    expect(data.found).toBe(false);
  });

  it("returns beneficial_owners array", () => {
    const result = companyLookupHandler({ company_name: "Acme Corp" });
    const data = JSON.parse(result.content[0].text);
    expect(Array.isArray(data.data.beneficial_owners)).toBe(true);
    expect(data.data.beneficial_owners[0].ownership_pct).toBeGreaterThan(0);
  });
});

describe("risk_score", () => {
  it("returns score between 0 and 100", () => {
    const result = riskScoreHandler({
      company_name: "Test Corp",
      jurisdiction: "US",
      industry: "Technology",
    });
    const data = JSON.parse(result.content[0].text);
    expect(data.overall_score).toBeGreaterThanOrEqual(0);
    expect(data.overall_score).toBeLessThanOrEqual(100);
  });

  it("high-risk jurisdiction increases score", () => {
    const low = JSON.parse(
      riskScoreHandler({ company_name: "Test", jurisdiction: "US", industry: "Technology" }).content[0].text
    );
    const high = JSON.parse(
      riskScoreHandler({ company_name: "Test", jurisdiction: "IR", industry: "Technology" }).content[0].text
    );
    expect(high.overall_score).toBeGreaterThan(low.overall_score);
  });

  it("PEP involvement raises score to high or critical tier", () => {
    const result = riskScoreHandler({
      company_name: "Test",
      jurisdiction: "VG",
      industry: "Trading",
      pep_involved: true,
      ownership_complexity: "opaque",
    });
    const data = JSON.parse(result.content[0].text);
    expect(["high", "critical"]).toContain(data.risk_tier);
  });

  it("returns recommendation field", () => {
    const result = riskScoreHandler({ company_name: "Test", jurisdiction: "US", industry: "Retail" });
    const data = JSON.parse(result.content[0].text);
    expect(data.recommendation).toBeDefined();
  });
});

describe("sanctions_check", () => {
  it("returns CLEAR for clean entity", () => {
    const result = sanctionsCheckHandler({ name: "Apple Inc" });
    const data = JSON.parse(result.content[0].text);
    expect(data.status).toBe("CLEAR");
    expect(data.action_required).toBe(false);
  });

  it("returns MATCH for known sanctioned entity", () => {
    const result = sanctionsCheckHandler({ name: "Viktor Bout" });
    const data = JSON.parse(result.content[0].text);
    expect(data.status).toBe("MATCH");
    expect(data.exact_matches.length).toBeGreaterThan(0);
  });

  it("includes all four lists in checked_lists", () => {
    const result = sanctionsCheckHandler({ name: "Test Entity" });
    const data = JSON.parse(result.content[0].text);
    expect(data.checked_lists).toContain("OFAC_SDN");
    expect(data.checked_lists).toContain("UN_SC");
    expect(data.checked_lists).toContain("EU_CONSOLIDATED");
    expect(data.checked_lists).toContain("UK_OFSI");
  });

  it("detects EU-listed company", () => {
    const result = sanctionsCheckHandler({ name: "Global Trade Partners Ltd" });
    const data = JSON.parse(result.content[0].text);
    expect(data.status).toBe("MATCH");
  });
});

describe("doc_summary", () => {
  const sampleDoc = `
    Invoice from Global Trade Partners Ltd dated 2024-03-15.
    Payment of $450,000 USD for consulting services rendered.
    Beneficial owner not identified. Transaction processed through offshore account.
    Signed by nominee director on behalf of bearer shares holder.
  `;

  it("returns summary and risk_flags", () => {
    const result = docSummaryHandler({ document_text: sampleDoc });
    const data = JSON.parse(result.content[0].text);
    expect(data.summary).toBeDefined();
    expect(Array.isArray(data.risk_flags)).toBe(true);
  });

  it("detects high-risk keywords", () => {
    const result = docSummaryHandler({ document_text: sampleDoc });
    const data = JSON.parse(result.content[0].text);
    expect(data.risk_flags.length).toBeGreaterThan(0);
    expect(data.risk_level).not.toBe("low");
  });

  it("extracts amounts and dates", () => {
    const result = docSummaryHandler({ document_text: sampleDoc, extract_entities: true });
    const data = JSON.parse(result.content[0].text);
    expect(data.extracted_amounts.length).toBeGreaterThan(0);
    expect(data.extracted_dates.length).toBeGreaterThan(0);
  });

  it("returns low risk for clean document", () => {
    const clean = "Annual report for Acme Corp. Revenue was $15,000,000 in fiscal year 2024.";
    const result = docSummaryHandler({ document_text: clean });
    const data = JSON.parse(result.content[0].text);
    expect(data.risk_level).toBe("low");
  });
});
