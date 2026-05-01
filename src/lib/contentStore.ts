import { COLLEGES, FEELINGS, DIRECTIONS, STATES, type College } from "./colleges";

// "Backend" for the admin panel — persists in localStorage so all
// frontend additions made from /admin show up across the journey.

export type Feeling = { id: string; label: string; hint: string; hue: number };
export type AppSettings = {
  allowStateMismatch: boolean;
};
export type ContentSnapshot = {
  colleges: College[];
  feelings: Feeling[];
  directions: string[];
  states: string[];
  settings: AppSettings;
};

const KEY = "xorb:content:v1";
const EVT = "xorb:content:changed";

function defaults(): ContentSnapshot {
  return {
    colleges: [...COLLEGES],
    feelings: FEELINGS.map((f) => ({ ...f })),
    directions: [...DIRECTIONS],
    states: [...STATES],
    settings: { allowStateMismatch: false },
  };
}

export function loadContent(): ContentSnapshot {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(KEY);
    const base = defaults();
    const parsed = raw ? JSON.parse(raw) as Partial<ContentSnapshot> : {};
    // Load colleges from separate key (may be large)
    const savedColleges = loadColleges();
    return {
      colleges: savedColleges ?? parsed.colleges ?? base.colleges,
      feelings: parsed.feelings ?? base.feelings,
      directions: parsed.directions ?? base.directions,
      states: parsed.states ?? base.states,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return defaults();
  }
}

// Slim a college down to minimum fields for storage
function slimCollege(c: College): Partial<College> {
  return {
    id: c.id, name: c.name, location: c.location, state: c.state,
    ownership: c.ownership, type: c.type, contextTag: c.contextTag,
    website: c.website, tier: c.tier, vibe: c.vibe,
    ...(c.established ? { established: c.established } : {}),
    ...(c.distanceFromMetro ? { distanceFromMetro: c.distanceFromMetro } : {}),
    ...(c.category ? { category: c.category } : {}),
    ...(c.order !== undefined ? { order: c.order } : {}),
  };
}

const COLLEGES_KEY = "xorb:colleges:v1";

function saveColleges(colleges: College[]) {
  // Save colleges separately — slimmed down to save space
  const slimmed = colleges.map(slimCollege);
  const json = JSON.stringify(slimmed);
  // If over 4MB warn but still try
  if (json.length > 4_000_000) {
    console.warn(`[Campus Compass] College data is large (${(json.length/1024/1024).toFixed(1)}MB). Storing top 5000 only.`);
    const trimmed = slimmed.slice(0, 5000);
    try {
      localStorage.setItem(COLLEGES_KEY, JSON.stringify(trimmed));
    } catch {
      // If still fails, store top 2000
      localStorage.setItem(COLLEGES_KEY, JSON.stringify(slimmed.slice(0, 2000)));
      console.warn("[Campus Compass] Storage very limited — storing top 2000 colleges only.");
    }
    return;
  }
  try {
    localStorage.setItem(COLLEGES_KEY, json);
  } catch {
    // Quota exceeded — trim to 3000
    try {
      localStorage.setItem(COLLEGES_KEY, JSON.stringify(slimmed.slice(0, 3000)));
    } catch {
      localStorage.setItem(COLLEGES_KEY, JSON.stringify(slimmed.slice(0, 1000)));
    }
  }
}

function loadColleges(): College[] | null {
  try {
    const raw = localStorage.getItem(COLLEGES_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as College[];
  } catch { return null; }
}

export function saveContent(next: ContentSnapshot) {
  if (typeof window === "undefined") return;
  // Save colleges separately
  saveColleges(next.colleges);
  // Save everything else (small data) in main key
  const withoutColleges = { ...next, colleges: [] };
  try {
    localStorage.setItem(KEY, JSON.stringify(withoutColleges));
  } catch {
    console.warn("[Campus Compass] Could not save settings to localStorage");
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function resetContent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(COLLEGES_KEY);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function subscribeContent(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

// React hook
import { useEffect, useState } from "react";
export function useContent(): ContentSnapshot {
  const [snap, setSnap] = useState<ContentSnapshot>(() => loadContent());
  useEffect(() => subscribeContent(() => setSnap(loadContent())), []);
  return snap;
}

// ---- Analytics tracking ----
export type AnalyticsEvent = {
  type: "view" | "click" | "share_open";
  collegeId: string;
  collegeName: string;
  ts: number;
};
const ANALYTICS_KEY = "xorb:analytics:v1";
const ANALYTICS_EVT = "xorb:analytics:changed";

export function loadAnalytics(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function trackEvent(e: Omit<AnalyticsEvent, "ts">) {
  if (typeof window === "undefined") return;
  const log = loadAnalytics();
  log.push({ ...e, ts: Date.now() });
  // Cap at 5000 events
  const trimmed = log.slice(-5000);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new CustomEvent(ANALYTICS_EVT));
}

export function clearAnalytics() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANALYTICS_KEY);
  window.dispatchEvent(new CustomEvent(ANALYTICS_EVT));
}

export function useAnalytics(): AnalyticsEvent[] {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => loadAnalytics());
  useEffect(() => {
    const handler = () => setEvents(loadAnalytics());
    window.addEventListener(ANALYTICS_EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(ANALYTICS_EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return events;
}

// ---- Demo admin auth (frontend only) ----
const AUTH_KEY = "xorb:admin:session";
export const ADMIN_DEMO = { username: "studentxorb@gmail.com", password: "Admin123." };

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_DEMO.username && password === ADMIN_DEMO.password) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ at: Date.now() }));
    window.dispatchEvent(new CustomEvent("xorb:auth:changed"));
    return true;
  }
  return false;
}

export function adminLogout() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent("xorb:auth:changed"));
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(AUTH_KEY);
}

export function useIsAdmin(): boolean {
  const [ok, setOk] = useState<boolean>(() => isAdmin());
  useEffect(() => {
    const handler = () => setOk(isAdmin());
    window.addEventListener("xorb:auth:changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("xorb:auth:changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return ok;
}