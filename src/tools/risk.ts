import { HIGH_RISK_JURISDICTIONS, INDUSTRY_RISK } from "../data/mock.js";

export interface RiskScoreArgs {
  company_name: string;
  jurisdiction: string;
  industry: string;
  ownership_complexity?: "simple" | "layered" | "opaque";
  pep_involved?: boolean;
  revenue_usd?: number;
}

type RiskTier = "low" | "medium" | "high" | "critical";
type Recommendation = "standard_due_diligence" | "enhanced_due_diligence" | "escalate_to_compliance";

interface RiskFactor {
  score: number;
  rationale: string;
}

export function riskScoreHandler(args: Record<string, unknown>): {
  content: Array<{ type: "text"; text: string }>;
} {
  const {
    company_name,
    jurisdiction,
    industry,
    ownership_complexity = "simple",
    pep_involved = false,
    revenue_usd = 0,
  } = args as unknown as RiskScoreArgs;

  const factors: Record<string, RiskFactor> = {};
  let total = 0;

  const jurisdictionScore = HIGH_RISK_JURISDICTIONS.has(jurisdiction.toUpperCase()) ? 40 : 5;
  factors["jurisdiction"] = {
    score: jurisdictionScore,
    rationale: HIGH_RISK_JURISDICTIONS.has(jurisdiction.toUpperCase())
      ? `${jurisdiction} is a high-risk or sanctioned jurisdiction`
      : `${jurisdiction} is a standard jurisdiction`,
  };
  total += jurisdictionScore;

  const industryScore = INDUSTRY_RISK[industry] ?? 15;
  factors["industry"] = {
    score: industryScore,
    rationale: `${industry} industry baseline risk`,
  };
  total += industryScore;

  const ownershipScore =
    ownership_complexity === "opaque" ? 25 : ownership_complexity === "layered" ? 15 : 5;
  factors["ownership_structure"] = {
    score: ownershipScore,
    rationale: `${ownership_complexity} ownership structure`,
  };
  total += ownershipScore;

  if (pep_involved) {
    factors["pep_exposure"] = { score: 20, rationale: "Politically Exposed Person in ownership chain" };
    total += 20;
  }

  if (revenue_usd > 100_000_000) {
    factors["revenue_scale"] = { score: 5, rationale: "High-revenue entity — elevated monitoring threshold" };
    total += 5;
  }

  const capped = Math.min(total, 100);
  const tier: RiskTier =
    capped >= 70 ? "critical" : capped >= 45 ? "high" : capped >= 25 ? "medium" : "low";
  const recommendation: Recommendation =
    tier === "critical" || tier === "high"
      ? "escalate_to_compliance"
      : tier === "medium"
      ? "enhanced_due_diligence"
      : "standard_due_diligence";

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            company: company_name,
            overall_score: capped,
            risk_tier: tier,
            recommendation,
            factors,
            assessed_at: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}
