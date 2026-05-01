import { createClient } from "@supabase/supabase-js";

// ── Supabase config ───────────────────────────────────────
// Project: studentxorb's Project
// URL: https://bjloklyafimvfbhugyij.supabase.co
// Get your anon key from: Supabase Dashboard → Settings → API → anon public key

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://bjloklyafimvfbhugyij.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key-not-configured";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ──────────────────────────────────────────

export async function signUpWithEmail(email: string, name?: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: { name: name || "" },
      emailRedirectTo: `${window.location.origin}/campus-compass/`,
    },
  });
  return { data, error };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ── Favourites (synced to Supabase) ──────────────────────

export async function saveFavouriteToDb(collegeId: string) {
  const user = await getUser();
  if (!user) return;
  await supabase.from("favourites").upsert({
    user_id: user.id,
    college_id: collegeId,
    created_at: new Date().toISOString(),
  });
}

export async function removeFavouriteFromDb(collegeId: string) {
  const user = await getUser();
  if (!user) return;
  await supabase.from("favourites").delete().eq("user_id", user.id).eq("college_id", collegeId);
}

export async function getFavouritesFromDb(): Promise<string[]> {
  const user = await getUser();
  if (!user) return [];
  const { data } = await supabase.from("favourites").select("college_id").eq("user_id", user.id);
  return (data || []).map((r: { college_id: string }) => r.college_id);
}

// ── Journey saves ─────────────────────────────────────────

export async function saveJourneyToDb(feeling: string | null, direction: string | null, states: string[]) {
  const user = await getUser();
  if (!user) return;
  await supabase.from("journeys").upsert({
    user_id: user.id,
    feeling,
    direction,
    states,
    updated_at: new Date().toISOString(),
  });
}

export async function getJourneyFromDb() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase.from("journeys").select("*").eq("user_id", user.id).single();
  return data;
}
