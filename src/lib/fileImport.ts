// Parses CSV/Excel/JSON into colleges. PDFs accepted as text best-effort.
import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { College } from "./colleges";

export type ParsedRow = Record<string, string>;

const HEADERS: Record<keyof Omit<College, "id" | "vibe" | "order">, string[]> = {
  name: ["name", "college", "college name", "institution", "institute"],
  location: ["city", "location", "district", "place"],
  state: ["state", "region"],
  ownership: ["ownership", "type of institution", "management"],
  type: ["type", "field", "stream", "discipline", "category"],
  contextTag: ["tagline", "context", "description", "tag", "about"],
  website: ["website", "url", "link", "site"],
  tier: ["tier", "level"],
};

function pickField(row: ParsedRow, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const k = keys.find((x) => x.trim().toLowerCase() === cand.toLowerCase());
    if (k && row[k]) return String(row[k]).trim();
  }
  return "";
}

function inferOwnership(v: string): College["ownership"] {
  const x = v.toLowerCase();
  if (x.includes("gov")) return "Government";
  if (x.includes("private")) return "Private";
  if (x.includes("auto")) return "Autonomous";
  if (x.includes("deem")) return "Deemed";
  return "Private";
}

function inferType(v: string): College["type"] {
  const x = v.toLowerCase();
  if (x.includes("eng") || x.includes("tech")) return "Engineering";
  if (x.includes("med") || x.includes("aiims") || x.includes("health")) return "Medical";
  if (x.includes("art") || x.includes("design") || x.includes("film") || x.includes("humanities")) return "Arts";
  if (x.includes("comm") || x.includes("business") || x.includes("management")) return "Commerce";
  return "Others";
}

function inferTier(v: string, name: string): College["tier"] {
  const x = (v + " " + name).toLowerCase();
  if (x.includes("iit") || x.includes("nit") || x.includes("aiims") || x.includes("iisc") || x.includes("iim") || x.includes("growth")) return "growth";
  if (x.includes("explore")) return "explore";
  return "fit";
}

export function rowsToColleges(rows: ParsedRow[]): College[] {
  return rows
    .map((row, i) => {
      const name = pickField(row, HEADERS.name);
      if (!name) return null;
      const ownershipRaw = pickField(row, HEADERS.ownership);
      const typeRaw = pickField(row, HEADERS.type);
      const tierRaw = pickField(row, HEADERS.tier);
      const website = pickField(row, HEADERS.website) || `https://www.google.com/search?q=${encodeURIComponent(name)}`;
      return {
        id: `imp-${Date.now()}-${i}`,
        name,
        location: pickField(row, HEADERS.location) || "—",
        state: pickField(row, HEADERS.state) || "—",
        ownership: inferOwnership(ownershipRaw),
        type: inferType(typeRaw || name),
        contextTag: pickField(row, HEADERS.contextTag) || "A path worth exploring",
        website: website.startsWith("http") ? website : `https://${website}`,
        tier: inferTier(tierRaw, name),
        vibe: [],
      } as College;
    })
    .filter((x): x is College => !!x);
}

export async function parseFile(file: File): Promise<College[]> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "json") {
    const text = await file.text();
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      // already shaped like colleges?
      if (data[0] && typeof data[0] === "object" && "name" in data[0] && "state" in data[0]) {
        return data as College[];
      }
      return rowsToColleges(data as ParsedRow[]);
    }
    if (data.colleges) return data.colleges as College[];
    return [];
  }
  if (ext === "csv" || ext === "txt") {
    const text = await file.text();
    const out = Papa.parse<ParsedRow>(text, { header: true, skipEmptyLines: true });
    return rowsToColleges(out.data);
  }
  if (ext === "xlsx" || ext === "xls") {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const all: ParsedRow[] = [];
    for (const sheet of wb.SheetNames) {
      const rows = XLSX.utils.sheet_to_json<ParsedRow>(wb.Sheets[sheet], { defval: "" });
      all.push(...rows);
    }
    return rowsToColleges(all);
  }
  if (ext === "pdf") {
    // Best-effort: extract text from PDF using simple regex on streams (no full parser)
    // For real usage you'd run server-side OCR. Here we extract any college-like lines.
    const text = await file.text().catch(() => "");
    const lines = text.split(/[\r\n]+/).filter((l) => l.length > 4 && /[A-Za-z]/.test(l));
    return rowsToColleges(lines.slice(0, 200).map((l) => ({ name: l.trim() })));
  }
  throw new Error(`Unsupported file type: .${ext}`);
}
