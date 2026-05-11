import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { College } from "@/lib/colleges";

export type FavoriteRow = {
  id: string;
  college_id: string;
  college_name: string;
  created_at: string;
};

type Ctx = {
  enabled: boolean;
  loading: boolean;
  favorites: FavoriteRow[];
  ids: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (c: College) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const FavCtx = createContext<Ctx>({
  enabled: false,
  loading: false,
  favorites: [],
  ids: new Set(),
  isFavorite: () => false,
  toggle: async () => {},
  remove: async () => {},
  refresh: async () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("id, college_id, college_name, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setFavorites(data as FavoriteRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ids = useMemo(() => new Set(favorites.map((f) => f.college_id)), [favorites]);

  const toggle = useCallback(
    async (c: College) => {
      if (!user) {
        toast.error("Sign in to save favorites");
        return;
      }
      if (ids.has(c.id)) {
        const row = favorites.find((f) => f.college_id === c.id);
        if (!row) return;
        const prev = favorites;
        setFavorites((xs) => xs.filter((x) => x.id !== row.id));
        const { error } = await supabase.from("favorites").delete().eq("id", row.id);
        if (error) {
          setFavorites(prev);
          toast.error("Couldn't remove favorite");
        } else {
          toast("Removed from favorites");
        }
      } else {
        const { data, error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, college_id: c.id, college_name: c.name })
          .select("id, college_id, college_name, created_at")
          .single();
        if (error || !data) {
          toast.error("Couldn't save favorite");
        } else {
          setFavorites((xs) => [data as FavoriteRow, ...xs]);
          toast.success(`Saved ${c.name}`);
        }
      }
    },
    [user, ids, favorites]
  );

  const remove = useCallback(
    async (id: string) => {
      const prev = favorites;
      setFavorites((xs) => xs.filter((x) => x.id !== id));
      const { error } = await supabase.from("favorites").delete().eq("id", id);
      if (error) {
        setFavorites(prev);
        toast.error("Couldn't remove favorite");
      }
    },
    [favorites]
  );

  return (
    <FavCtx.Provider
      value={{
        enabled: !!user,
        loading,
        favorites,
        ids,
        isFavorite: (id) => ids.has(id),
        toggle,
        remove,
        refresh,
      }}
    >
      {children}
    </FavCtx.Provider>
  );
}

export const useFavorites = () => useContext(FavCtx);