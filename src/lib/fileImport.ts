// Parses CSV/Excel/JSON into colleges — handles AISHE format and custom formats
import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { College } from "./colleges";

export type ParsedRow = Record<string, string>;

// ── Column name aliases ───────────────────────────────────
// Maps our internal field name → possible CSV column names (case-insensitive)
const COL_MAP: Record<string, string[]> = {
  name:        ["name", "college", "college name", "institution", "institute", "university name", "institution name", "college_name"],
  location:    ["city", "location", "district", "place", "town", "campus city", "campus location"],
  state:       ["state", "region", "province", "state name"],
  ownership:   ["ownership", "type of institution", "management", "managed by", "ownership type", "university type", "type of university"],
  type:        ["type", "field", "stream", "discipline", "course type", "programme type", "specialization"],
  contextTag:  ["tagline", "context", "description", "tag", "about", "context tag", "slogan", "highlight"],
  website:     ["website", "url", "link", "site", "web", "homepage", "website url"],
  tier:        ["tier", "level", "rank tier", "rank"],
  established: ["established", "founded", "year", "estd", "year of establishment", "year_of_establishment", "founded year"],
  category:    ["category", "institution type", "college type", "type of institution"],
  aisheCode:   ["aishe code", "aishe_code", "code", "university code"],
  locationType:["location type", "location", "rural/urban", "area type"],
};

// ── Pick a field from a row using aliases ─────────────────
function pickField(row: ParsedRow, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const k = keys.find((x) => x.trim().toLowerCase() === cand.toLowerCase());
    if (k && row[k] && String(row[k]).trim() !== "-") return String(row[k]).trim();
  }
  return "";
}

// ── Find the real header row ──────────────────────────────
// Handles files like AISHE where row 1 is a title and row 2 is headers
function findHeaderRow(rawRows: string[][]): { headerIdx: number; headers: string[] } | null {
  const KNOWN_HEADERS = ["name", "state", "district", "website", "aishe code", "college", "institution", "university"];
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const row = rawRows[i].map((c) => c.toLowerCase().trim());
    const matches = KNOWN_HEADERS.filter((h) => row.some((c) => c.includes(h)));
    if (matches.length >= 2) {
      return { headerIdx: i, headers: rawRows[i].map((c) => c.trim()) };
    }
  }
  return null;
}

// ── Infer ownership ───────────────────────────────────────
function inferOwnership(v: string, name: string): College["ownership"] {
  const x = (v + " " + name).toLowerCase();
  if (x.includes("central") || x.includes("national") || x.includes("government") || x.includes("gov") || x.includes("kendriya")) return "Government";
  if (x.includes("deemed")) return "Deemed";
  if (x.includes("autonomous")) return "Autonomous";
  if (x.includes("private") || x.includes("pvt")) return "Private";
  // AISHE: Central University = Government, State Public = Government, State Private = Private, Deemed-Govt = Deemed
  if (x.includes("state public")) return "Government";
  if (x.includes("state private")) return "Private";
  if (x.includes("deemed")) return "Deemed";
  return "Private";
}

// ── Infer type from name + field ──────────────────────────
function inferType(name: string, field: string): College["type"] {
  const x = (name + " " + field).toLowerCase();
  if (x.match(/\b(iit|nit|iiit|engineering|technology|tech|b\.?tech|polytechnic|computer science)\b/)) return "Engineering";
  if (x.match(/\b(medical|medicine|aiims|mbbs|health|dental|pharmacy|pharma|nursing|ayurved|homoeo)\b/)) return "Medical";
  if (x.match(/\b(art|design|film|humanities|liberal|fine art|law|legal|social|music|dance|drama|journalism)\b/)) return "Arts";
  if (x.match(/\b(commerce|business|management|mba|bba|finance|account|economics|ca |chartered)\b/)) return "Commerce";
  if (x.match(/\b(agriculture|agri|veterinary|horticulture|fishery|forest|dairy)\b/)) return "Others";
  if (x.match(/\b(research|science|iiser|isc|iisc)\b/)) return "Others";
  return "Others";
}

// ── Infer tier ────────────────────────────────────────────
function inferTier(name: string, tierRaw: string): College["tier"] {
  const x = (name + " " + tierRaw).toLowerCase();
  if (x.match(/\b(iit|iim|aiims|iisc|iiser|nit bombay|nit trichy|bits)\b/)) return "growth";
  if (x.match(/\b(nit|iiit|nift|nid|spa|niper|isi)\b/)) return "fit";
  if (tierRaw.toLowerCase().includes("explore")) return "explore";
  if (tierRaw.toLowerCase().includes("growth")) return "growth";
  return "fit";
}

// ── Infer distance from location type ────────────────────
function inferDistance(locationType: string, district: string): College["distanceFromMetro"] {
  const lt = locationType.toLowerCase();
  const METROS = ["mumbai","delhi","bangalore","bengaluru","chennai","kolkata","hyderabad","pune","ahmedabad"];
  if (lt === "urban" && METROS.some((m) => district.toLowerCase().includes(m))) return "Near";
  if (lt === "urban") return "Moderate";
  return "Far";
}

// ── Convert parsed rows → College objects ─────────────────
export function rowsToColleges(rows: ParsedRow[], sourceName?: string): College[] {
  if (!rows || rows.length === 0) {
    throw new Error("The file appears to be empty or has no data rows.");
  }

  const results = rows.map((row, i) => {
    const name = pickField(row, COL_MAP.name);
    if (!name || name.toLowerCase() === "name") return null; // skip header rows if duplicated

    const location   = pickField(row, COL_MAP.location) || "—";
    const state      = pickField(row, COL_MAP.state) || "—";
    const typeRaw    = pickField(row, COL_MAP.type);
    const ownershipRaw = pickField(row, COL_MAP.ownership);
    const estRaw     = pickField(row, COL_MAP.established);
    const locType    = pickField(row, COL_MAP.locationType);
    const websiteRaw = pickField(row, COL_MAP.website);
    const tierRaw    = pickField(row, COL_MAP.tier);
    const website    = websiteRaw
      ? (websiteRaw.startsWith("http") ? websiteRaw : `https://${websiteRaw}`)
      : `https://www.google.com/search?q=${encodeURIComponent(name + " university")}`;

    const established = estRaw && !isNaN(parseInt(estRaw)) ? parseInt(estRaw) : undefined;
    const distanceFromMetro = inferDistance(locType, location);

    return {
      id: `imp-${Date.now()}-${i}`,
      name,
      location,
      state,
      ownership: inferOwnership(ownershipRaw, name),
      type: inferType(name, typeRaw),
      contextTag: pickField(row, COL_MAP.contextTag) || "A path worth exploring",
      website,
      tier: inferTier(name, tierRaw),
      vibe: [],
      established,
      distanceFromMetro,
      category: sourceName?.includes("University") ? "University" :
                sourceName?.includes("National") || sourceName?.includes("IIT") || sourceName?.includes("NIT") ? "National Importance" :
                "College",
    } as College;
  }).filter((x): x is College => !!x);

  if (results.length === 0) {
    const keys = Object.keys(rows[0] || {});
    throw new Error(
      `Could not map any colleges. Columns found in your file: "${keys.join('", "')}". ` +
      `Required: a column named "name", "college", "institution", or "university name".`
    );
  }

  return results;
}

// ── Parse raw CSV text (handles title rows, BOM, CRLF) ───
function parseCSVText(text: string, fileName: string): College[] {
  // Remove BOM
  const cleaned = text.replace(/^\uFEFF/, "");
  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim());

  // Split all rows first to find real header row
  const rawRows = lines.map((l) => {
    const result = Papa.parse<string[]>(l, { header: false });
    return (result.data[0] || []) as string[];
  });

  const headerInfo = findHeaderRow(rawRows);

  if (!headerInfo) {
    // Fallback: just try parsing the whole thing normally
    const out = Papa.parse<ParsedRow>(cleaned, { header: true, skipEmptyLines: true });
    return rowsToColleges(out.data, fileName);
  }

  // Re-parse from the header row onward
  const relevantLines = lines.slice(headerInfo.headerIdx);
  const rejoined = relevantLines.join("\n");
  const out = Papa.parse<ParsedRow>(rejoined, { header: true, skipEmptyLines: true });
  return rowsToColleges(out.data, fileName);
}

// ── Main entry point ──────────────────────────────────────
export async function parseFile(file: File): Promise<College[]> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const fileName = file.name;

  if (ext === "json") {
    const text = await file.text();
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      if (data[0] && typeof data[0] === "object" && "name" in data[0] && "state" in data[0]) {
        return data as College[];
      }
      return rowsToColleges(data as ParsedRow[], fileName);
    }
    if (data.colleges) return data.colleges as College[];
    return [];
  }

  if (ext === "csv" || ext === "txt") {
    const text = await file.text();
    return parseCSVText(text, fileName);
  }

  if (ext === "xlsx" || ext === "xls") {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const all: string[][] = [];
    let headers: string[] | null = null;

    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];

      if (!headers) {
        // Find the real header row
        for (let i = 0; i < Math.min(5, raw.length); i++) {
          const row = raw[i].map((c) => String(c).toLowerCase().trim());
          const KNOWN = ["name", "state", "district", "website", "aishe", "college", "institution"];
          if (KNOWN.filter((h) => row.some((c) => c.includes(h))).length >= 2) {
            headers = raw[i].map((c) => String(c).trim());
            all.push(...raw.slice(i + 1));
            break;
          }
        }
        if (!headers) {
          headers = raw[0].map((c) => String(c).trim());
          all.push(...raw.slice(1));
        }
      } else {
        all.push(...raw.slice(1));
      }
    }

    if (!headers) throw new Error("Could not find headers in Excel file.");

    const rows: ParsedRow[] = all
      .filter((r) => r.some((c) => c !== ""))
      .map((r) => {
        const obj: ParsedRow = {};
        (headers as string[]).forEach((h, i) => { obj[h] = String(r[i] ?? "").trim(); });
        return obj;
      });

    return rowsToColleges(rows, fileName);
  }

  throw new Error(`Unsupported file type: .${ext}. Please use CSV, Excel (.xlsx), or JSON.`);
}
