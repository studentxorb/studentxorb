import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_color: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, bio, avatar_color")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else {
      // Create profile if it doesn't exist yet
      await supabase.from("profiles").insert({ id: user.id, full_name: user.user_metadata?.full_name ?? null });
      setProfile({ id: user.id, full_name: user.user_metadata?.full_name ?? null, bio: null, avatar_color: "#6366f1" });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = async (fields: Partial<Pick<Profile, "full_name" | "bio" | "avatar_color">>) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to save changes.");
    } else {
      setProfile((p) => p ? { ...p, ...fields } : p);
      toast.success("Profile updated.");
    }
    setSaving(false);
  };

  return { profile, loading, saving, update, refetch: fetch };
}
