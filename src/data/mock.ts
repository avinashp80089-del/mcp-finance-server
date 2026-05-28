export interface BeneficialOwner {
  name: string;
  ownership_pct: number;
  nationality: string;
  pep: boolean;
}

export interface CompanyRecord {
  name: string;
  aliases: string[];
  registration_number: string;
  jurisdiction: string;
  incorporation_date: string;
  status: "active" | "dissolved" | "suspended";
  business_type: string;
  registered_address: string;
  beneficial_owners: BeneficialOwner[];
  industry: string;
  employees: number;
  annual_revenue_usd: number;
  high_risk_jurisdiction: boolean;
}

export const COMPANY_DB: Record<string, CompanyRecord> = {
  "acme corp": {
    name: "Acme Corp",
    aliases: ["Acme Corporation", "ACME LLC"],
    registration_number: "DE-7823041",
    jurisdiction: "US",
    incorporation_date: "2010-03-15",
    status: "active",
    business_type: "LLC",
    registered_address: "1209 Orange St, Wilmington, DE 19801, US",
    beneficial_owners: [
      { name: "John Smith", ownership_pct: 60, nationality: "US", pep: false },
      { name: "Jane Doe", ownership_pct: 40, nationality: "US", pep: false },
    ],
    industry: "Technology",
    employees: 250,
    annual_revenue_usd: 15_000_000,
    high_risk_jurisdiction: false,
  },
  "global trade partners": {
    name: "Global Trade Partners Ltd",
    aliases: ["GTP Ltd", "Global Trade"],
    registration_number: "BVI-2024-08812",
    jurisdiction: "VG",
    incorporation_date: "2019-07-01",
    status: "active",
    business_type: "IBC",
    registered_address: "Tortola, British Virgin Islands",
    beneficial_owners: [
      { name: "Omar Al-Rashid", ownership_pct: 100, nationality: "AE", pep: true },
    ],
    industry: "Trading",
    employees: 8,
    annual_revenue_usd: 42_000_000,
    high_risk_jurisdiction: true,
  },
  "meridian holdings": {
    name: "Meridian Holdings SA",
    aliases: ["Meridian SA"],
    registration_number: "CH-270.3.042.981-7",
    jurisdiction: "CH",
    incorporation_date: "2005-11-22",
    status: "active",
    business_type: "SA",
    registered_address: "Bahnhofstrasse 12, 8001 Zürich, Switzerland",
    beneficial_owners: [
      { name: "Elena Novak", ownership_pct: 51, nationality: "CH", pep: false },
      { name: "Meridian Family Trust", ownership_pct: 49, nationality: "CH", pep: false },
    ],
    industry: "Financial Services",
    employees: 45,
    annual_revenue_usd: 8_500_000,
    high_risk_jurisdiction: false,
  },
};

export const SANCTIONS_LISTS: Record<string, string[]> = {
  OFAC_SDN: [
    "Viktor Bout",
    "Agrobank",
    "Dragon Capital Ltd",
    "Nordex LLC",
    "Global Steel Holdings",
  ],
  UN_SC: [
    "Al-Nusra Front",
    "Mahan Air",
    "Korea Mining Development Trading Corporation",
  ],
  EU_CONSOLIDATED: [
    "Rossiya Bank",
    "Bank of Moscow",
    "SMP Bank",
    "Tempbank",
    "Global Trade Partners Ltd",
  ],
  UK_OFSI: [
    "Concord Management",
    "Internet Research Agency",
  ],
};

export const HIGH_RISK_JURISDICTIONS = new Set([
  "AF", "BY", "CF", "CU", "CD", "ER", "ET", "GN", "HT", "IR",
  "IQ", "LB", "LY", "ML", "MM", "NI", "KP", "RU", "SO", "SS",
  "SD", "SY", "VE", "YE", "ZW", "VG", "KY", "PA", "SC",
]);

export const INDUSTRY_RISK: Record<string, number> = {
  "Technology": 10,
  "Financial Services": 20,
  "Trading": 25,
  "Real Estate": 20,
  "Cryptocurrency": 35,
  "Arms & Defense": 40,
  "Gaming & Gambling": 30,
  "Cannabis": 30,
  "Mining": 15,
  "Retail": 10,
  "Healthcare": 10,
  "Manufacturing": 12,
};
