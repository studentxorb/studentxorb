/**
 * Campus Compass — College Auto-Tagger
 * Maps colleges to tags based on:
 *  - Established year  → "Heritage", "Post-Independence", "Modern", "New-Gen"
 *  - State / city      → metro tier classification → distanceFromMetro
 *  - Category          → National Importance sub-types
 */

import type { College, CollegeCategory } from "./colleges";

// ── Metro cities by tier ──────────────────────────────────
const TIER1_METROS = [
  "Mumbai", "Delhi", "Bangalore", "Bengaluru", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Ahmedabad",
];

const TIER2_CITIES = [
  "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
  "Patna", "Vadodara", "Surat", "Visakhapatnam", "Coimbatore",
  "Kochi", "Thiruvananthapuram", "Bhubaneswar", "Guwahati",
  "Chandigarh", "Dehradun", "Ranchi", "Raipur", "Amritsar",
];

// ── Year → era tag ────────────────────────────────────────
export type EraTag = "Heritage" | "Post-Independence" | "Modern" | "New-Gen";

export function getEraTag(established?: number): EraTag | null {
  if (!established) return null;
  if (established <= 1900) return "Heritage";
  if (established <= 1960) return "Post-Independence";
  if (established <= 2000) return "Modern";
  return "New-Gen";
}

// ── Location → distance tag ───────────────────────────────
export type DistanceTag = "Near" | "Moderate" | "Far";

export function getDistanceTag(location: string, state: string): DistanceTag {
  const loc = location.toLowerCase();
  const inTier1 = TIER1_METROS.some((m) => loc.includes(m.toLowerCase()));
  if (inTier1) return "Near";

  const inTier2 = TIER2_CITIES.some((c) => loc.includes(c.toLowerCase()));
  if (inTier2) return "Moderate";

  // States that are primarily remote / hilly
  const remoteStates = [
    "Arunachal Pradesh", "Mizoram", "Nagaland", "Manipur",
    "Meghalaya", "Sikkim", "Ladakh", "Andaman & Nicobar", "Lakshadweep",
  ];
  if (remoteStates.includes(state)) return "Far";

  return "Moderate";
}

// ── Segment: National Importance vs Higher Education ──────
export type CollegeSegment = "National Importance" | "Higher Education";

const NATIONAL_IMPORTANCE_CATEGORIES: CollegeCategory[] = ["National Importance"];

export function getSegment(category?: CollegeCategory): CollegeSegment {
  if (category && NATIONAL_IMPORTANCE_CATEGORIES.includes(category)) {
    return "National Importance";
  }
  return "Higher Education";
}

// ── National Importance sub-type ──────────────────────────
export type NISubType =
  | "IIT" | "IIM" | "AIIMS" | "NIT" | "IISER" | "NIFT"
  | "NID" | "SPA" | "NIPER" | "ISI" | "IIIT" | "Others";

const NI_PATTERNS: { pattern: RegExp; type: NISubType }[] = [
  { pattern: /\bIIT\b|Indian Institute of Technology/i, type: "IIT" },
  { pattern: /\bIIM\b|Indian Institute of Management/i, type: "IIM" },
  { pattern: /\bAIIMS\b|All India Institute of Medical/i, type: "AIIMS" },
  { pattern: /\bNIT\b|National Institute of Technology/i, type: "NIT" },
  { pattern: /\bIISER\b|Indian Institute of Science Education/i, type: "IISER" },
  { pattern: /\bNIFT\b|National Institute of Fashion/i, type: "NIFT" },
  { pattern: /\bNID\b|National Institute of Design/i, type: "NID" },
  { pattern: /\bSPA\b|School of Planning and Architecture/i, type: "SPA" },
  { pattern: /\bNIPER\b|National Institute of Pharmaceutical/i, type: "NIPER" },
  { pattern: /\bISI\b|Indian Statistical Institute/i, type: "ISI" },
  { pattern: /\bIIIT\b|Indian Institute of Information Technology/i, type: "IIIT" },
];

export function getNISubType(name: string): NISubType {
  for (const { pattern, type } of NI_PATTERNS) {
    if (pattern.test(name)) return type;
  }
  return "Others";
}

// ── Master auto-tag function ──────────────────────────────
export type CollegeTags = {
  era: EraTag | null;
  distance: DistanceTag;
  segment: CollegeSegment;
  niSubType: NISubType | null;
};

export function autoTag(college: Pick<College, "name" | "location" | "state" | "established" | "category">): CollegeTags {
  const era = getEraTag(college.established);
  const distance = getDistanceTag(college.location, college.state);
  const segment = getSegment(college.category);
  const niSubType = segment === "National Importance" ? getNISubType(college.name) : null;
  return { era, distance, segment, niSubType };
}

// ── Batch tag all colleges ────────────────────────────────
export function batchAutoTag(colleges: College[]): (College & CollegeTags)[] {
  return colleges.map((c) => ({ ...c, ...autoTag(c) }));
}

// ── Display helpers ───────────────────────────────────────
export function eraLabel(tag: EraTag | null): string {
  if (!tag) return "";
  return {
    "Heritage": "🏛️ Heritage (pre-1900)",
    "Post-Independence": "🇮🇳 Post-Independence",
    "Modern": "🏗️ Modern era",
    "New-Gen": "⚡ New generation",
  }[tag];
}

export function distanceLabel(tag: DistanceTag): string {
  return {
    "Near": "📍 Near metro",
    "Moderate": "🚌 Moderate distance",
    "Far": "✈️ Remote location",
  }[tag];
}

export function segmentBadgeColor(segment: CollegeSegment): string {
  return segment === "National Importance"
    ? "bg-amber-500/15 text-amber-400"
    : "bg-blue-500/15 text-blue-400";
}
