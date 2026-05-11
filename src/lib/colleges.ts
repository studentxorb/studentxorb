export type College = {
  id: string;
  name: string;
  location: string;
  state: string;
  ownership: "Government" | "Private" | "Autonomous" | "Deemed";
  type: "Engineering" | "Medical" | "Arts" | "Commerce" | "Others";
  contextTag: string;
  website: string;
  tier: "fit" | "growth" | "explore";
  vibe: string[]; // matches feeling tags
  order?: number;
  segment?: "national" | "higher_ed"; // National Importance vs general Higher Education
  envTags?: string[]; // environment tag IDs (BEACH_CHILL, etc.) — empty = matches anywhere
  established?: number;
};

export function getCollegeSegment(c: { name: string; type?: string; segment?: "national" | "higher_ed" }): "national" | "higher_ed" {
  if (c.segment) return c.segment;
  const x = `${c.name} ${c.type ?? ""}`.toLowerCase();
  if (/(iit|iim|aiims|nit|iiit|iisc|iiser|nls|nid|nift|nlu|isi|niper|spa\b)/.test(x)) return "national";
  return "higher_ed";
}

export const SEGMENT_META: Record<"national" | "higher_ed", { label: string; eyebrow: string; desc: string }> = {
  national: {
    label: "National Institutes",
    eyebrow: "Institutions of national importance",
    desc: "IITs, IIMs, AIIMS, NITs, IISERs and other centrally recognized institutes.",
  },
  higher_ed: {
    label: "Universities & Colleges",
    eyebrow: "Higher education",
    desc: "State universities, deemed, autonomous and private colleges across India.",
  },
};

export const COLLEGES: College[] = [
  { id: "iit-b", name: "Indian Institute of Technology, Bombay", location: "Mumbai", state: "Maharashtra", ownership: "Government", type: "Engineering", contextTag: "A launchpad for ambitious engineers", website: "https://www.iitb.ac.in", tier: "growth", vibe: ["career", "city"] },
  { id: "iit-m", name: "Indian Institute of Technology, Madras", location: "Chennai", state: "Tamil Nadu", ownership: "Government", type: "Engineering", contextTag: "Research-driven and globally respected", website: "https://www.iitm.ac.in", tier: "growth", vibe: ["career"] },
  { id: "bits-p", name: "BITS Pilani", location: "Pilani", state: "Rajasthan", ownership: "Deemed", type: "Engineering", contextTag: "Freedom to design your own path", website: "https://www.bits-pilani.ac.in", tier: "fit", vibe: ["creative", "career"] },
  { id: "vit", name: "VIT Vellore", location: "Vellore", state: "Tamil Nadu", ownership: "Private", type: "Engineering", contextTag: "Could fit your goal", website: "https://vit.ac.in", tier: "fit", vibe: ["career", "peaceful"] },
  { id: "manipal", name: "Manipal Institute of Technology", location: "Manipal", state: "Karnataka", ownership: "Deemed", type: "Engineering", contextTag: "Beach town energy meets serious study", website: "https://manipal.edu", tier: "fit", vibe: ["peaceful", "creative"] },
  { id: "nit-t", name: "NIT Trichy", location: "Tiruchirappalli", state: "Tamil Nadu", ownership: "Government", type: "Engineering", contextTag: "A quiet powerhouse", website: "https://www.nitt.edu", tier: "fit", vibe: ["peaceful", "career"] },
  { id: "iiit-h", name: "IIIT Hyderabad", location: "Hyderabad", state: "Telangana", ownership: "Autonomous", type: "Engineering", contextTag: "Where research feels like play", website: "https://www.iiit.ac.in", tier: "growth", vibe: ["creative", "career", "city"] },
  { id: "dtu", name: "Delhi Technological University", location: "Delhi", state: "Delhi", ownership: "Government", type: "Engineering", contextTag: "Capital city, capital ambition", website: "http://www.dtu.ac.in", tier: "fit", vibe: ["city", "career"] },

  { id: "aiims-d", name: "AIIMS Delhi", location: "Delhi", state: "Delhi", ownership: "Government", type: "Medical", contextTag: "The dream of every aspiring doctor", website: "https://www.aiims.edu", tier: "growth", vibe: ["career", "city"] },
  { id: "cmc-v", name: "Christian Medical College", location: "Vellore", state: "Tamil Nadu", ownership: "Private", type: "Medical", contextTag: "Service-driven medicine, world-class care", website: "https://www.cmch-vellore.edu", tier: "fit", vibe: ["peaceful", "career"] },
  { id: "jipmer", name: "JIPMER", location: "Puducherry", state: "Puducherry", ownership: "Government", type: "Medical", contextTag: "Coastal calm with clinical depth", website: "https://jipmer.edu.in", tier: "fit", vibe: ["peaceful"] },
  { id: "kmc-m", name: "Kasturba Medical College", location: "Manipal", state: "Karnataka", ownership: "Deemed", type: "Medical", contextTag: "A complete student town", website: "https://manipal.edu/kmc-manipal", tier: "fit", vibe: ["peaceful", "creative"] },
  { id: "afmc", name: "Armed Forces Medical College", location: "Pune", state: "Maharashtra", ownership: "Government", type: "Medical", contextTag: "Discipline meets purpose", website: "https://afmc.nic.in", tier: "growth", vibe: ["career"] },

  { id: "srfti", name: "Satyajit Ray Film & TV Institute", location: "Kolkata", state: "West Bengal", ownership: "Government", type: "Arts", contextTag: "Where storytellers are made", website: "https://srfti.ac.in", tier: "fit", vibe: ["creative", "city"] },
  { id: "nid", name: "National Institute of Design", location: "Ahmedabad", state: "Gujarat", ownership: "Autonomous", type: "Arts", contextTag: "India's design crucible", website: "https://www.nid.edu", tier: "growth", vibe: ["creative"] },
  { id: "jnu", name: "Jawaharlal Nehru University", location: "Delhi", state: "Delhi", ownership: "Government", type: "Arts", contextTag: "A campus that thinks out loud", website: "https://www.jnu.ac.in", tier: "fit", vibe: ["city", "creative"] },
  { id: "fa-mau", name: "Faculty of Fine Arts, MSU", location: "Vadodara", state: "Gujarat", ownership: "Government", type: "Arts", contextTag: "Studio life, slow and rich", website: "https://msubaroda.ac.in", tier: "explore", vibe: ["creative", "peaceful"] },
  { id: "stx", name: "St. Xavier's College", location: "Mumbai", state: "Maharashtra", ownership: "Autonomous", type: "Arts", contextTag: "Heritage meets hustle", website: "https://xaviers.edu", tier: "fit", vibe: ["city", "creative"] },

  { id: "srcc", name: "Shri Ram College of Commerce", location: "Delhi", state: "Delhi", ownership: "Government", type: "Commerce", contextTag: "The benchmark for commerce in India", website: "https://www.srcc.edu", tier: "growth", vibe: ["career", "city"] },
  { id: "lsr", name: "Lady Shri Ram College", location: "Delhi", state: "Delhi", ownership: "Government", type: "Commerce", contextTag: "Sharp minds, sharper conversations", website: "https://lsr.edu.in", tier: "fit", vibe: ["city", "creative"] },
  { id: "ssc", name: "St. Stephen's College", location: "Delhi", state: "Delhi", ownership: "Autonomous", type: "Commerce", contextTag: "A century of intellectual culture", website: "https://www.ststephens.edu", tier: "growth", vibe: ["city"] },
  { id: "nmims", name: "NMIMS", location: "Mumbai", state: "Maharashtra", ownership: "Deemed", type: "Commerce", contextTag: "Built for business minds", website: "https://www.nmims.edu", tier: "fit", vibe: ["city", "career"] },
  { id: "christ", name: "Christ University", location: "Bengaluru", state: "Karnataka", ownership: "Deemed", type: "Commerce", contextTag: "Calm campus in a buzzing city", website: "https://christuniversity.in", tier: "fit", vibe: ["city", "peaceful"] },

  { id: "nls", name: "National Law School", location: "Bengaluru", state: "Karnataka", ownership: "Government", type: "Others", contextTag: "Where the law gets re-imagined", website: "https://www.nls.ac.in", tier: "growth", vibe: ["career", "city"] },
  { id: "tiss", name: "Tata Institute of Social Sciences", location: "Mumbai", state: "Maharashtra", ownership: "Deemed", type: "Others", contextTag: "Care, policy, and change-making", website: "https://www.tiss.edu", tier: "fit", vibe: ["city", "creative"] },
  { id: "iiserk", name: "IISER Kolkata", location: "Kolkata", state: "West Bengal", ownership: "Autonomous", type: "Others", contextTag: "Pure science, pure curiosity", website: "https://www.iiserkol.ac.in", tier: "explore", vibe: ["peaceful"] },
];

export const STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra",
  "Punjab", "Puducherry", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "West Bengal",
];

export const FEELINGS = [
  { id: "career",    label: "Strong career opportunities", hint: "I want a place that builds my career and opens doors.", hue: 0.58 },
  { id: "city",      label: "City exposure & growth",      hint: "I want a place buzzing with energy, internships, and possibility.", hue: 0.78 },
  { id: "peaceful",  label: "Peaceful campus life",        hint: "I want trees, focus, and real friendships.", hue: 0.40 },
  { id: "creative",  label: "Creative environment",        hint: "I want studios, makers, and late-night ideas.", hue: 0.92 },
  { id: "ambitious", label: "Fast, ambitious, career-focused", hint: "I want a high-energy place where everyone is chasing something big.", hue: 0.05 },
  { id: "balance",   label: "Balanced learning & lifestyle",   hint: "I want focus and academics — but also room to live my life.", hue: 0.50 },
  { id: "global",    label: "Global outlook",                  hint: "I want exposure to international ideas, exchanges, and people.", hue: 0.62 },
  { id: "research",  label: "Research & deep thinking",        hint: "I want time, mentorship, and a lab or studio that takes me seriously.", hue: 0.35 },
  { id: "community", label: "Strong community & friendships",  hint: "I want a place where I can build great friendships and feel a sense of belonging.", hue: 0.20 },
  { id: "campus",    label: "Vibrant campus life & events",    hint: "I want fests, events, activities, and an exciting campus life.", hue: 0.85 },
  { id: "freedom",   label: "Freedom & independence",          hint: "I want freedom to explore, make decisions, and grow independently.", hue: 0.10 },
  { id: "value",     label: "Value for money",                 hint: "I want a college that gives me good outcomes for the investment.", hue: 0.72 },
  { id: "unsure",    label: "Still figuring it out",           hint: "That's completely fair. We'll guide you gently.", hue: 0.15 },
] as const;

export const DIRECTIONS = ["Engineering", "Medical", "Arts", "Commerce", "Others", "Exploring"] as const;

/* ----------------- Environment → States mapping ----------------- */

export type EnvironmentTag = {
  id: string;
  label: string;
  hint: string;
  states: string[];
};

export const ENVIRONMENTS: EnvironmentTag[] = [
  { id: "BEACH_CHILL",     label: "Beach & Chill",            hint: "Coastal calm, slow mornings, salt air.", states: ["Goa","Kerala","Tamil Nadu","Andhra Pradesh","Odisha","Andaman & Nicobar","Lakshadweep","Puducherry","Dadra & Nagar Haveli and Daman & Diu"] },
  { id: "CITY_OPP",        label: "City Life & Opportunities", hint: "Internships, networks, infinite scroll of possibility.", states: ["Karnataka","Telangana","Maharashtra","Delhi","Haryana","Tamil Nadu","Gujarat","Uttar Pradesh","West Bengal","Madhya Pradesh","Punjab","Chandigarh","Bihar","Assam"] },
  { id: "NATURE_PEACE",    label: "Nature & Peaceful",         hint: "Forests, hills, quiet study afternoons.", states: ["Kerala","Himachal Pradesh","Uttarakhand","Sikkim","Meghalaya","Mizoram","Arunachal Pradesh","Jharkhand","Chhattisgarh","Tripura","Jammu & Kashmir","Assam"] },
  { id: "MOUNTAIN_ADV",    label: "Mountains & Adventure",     hint: "Trails, snow, big sky.", states: ["Himachal Pradesh","Uttarakhand","Sikkim","Arunachal Pradesh","Meghalaya","Jammu & Kashmir","Ladakh","Nagaland"] },
  { id: "CREATIVE_CULTURE",label: "Creative & Cultural",       hint: "Music, design, food, festivals.", states: ["West Bengal","Goa","Rajasthan","Tamil Nadu","Delhi","Karnataka","Kerala","Maharashtra","Punjab","Manipur","Nagaland","Assam","Bihar"] },
  { id: "STARTUP_GROWTH",  label: "Startup & Growth",          hint: "Where founders, builders and capital cluster.", states: ["Karnataka","Telangana","Maharashtra","Haryana","Delhi","Gujarat","Tamil Nadu"] },
  { id: "PRACTICAL_EXP",   label: "Practical Exposure",        hint: "Industry corridors, factories, hands-on labs.", states: ["Tamil Nadu","Gujarat","Maharashtra","Chhattisgarh","Odisha","Jharkhand","Andhra Pradesh","Madhya Pradesh","Dadra & Nagar Haveli and Daman & Diu","Rajasthan","Punjab"] },
  { id: "UNIQUE_EXP",      label: "Unique Experience",         hint: "Off the beaten path, rare landscapes, rare stories.", states: ["Ladakh","Andaman & Nicobar","Lakshadweep","Meghalaya","Mizoram","Nagaland","Arunachal Pradesh","Sikkim","Goa","Puducherry","Rajasthan"] },
];

/* All Indian states for the searchable picker */
export const ALL_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  // UTs
  "Andaman & Nicobar","Chandigarh","Dadra & Nagar Haveli and Daman & Diu","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];