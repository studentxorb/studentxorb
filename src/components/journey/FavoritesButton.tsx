import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Trash2, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { useFavorites } from "@/lib/favorites";
import { useAuth } from "@/lib/auth";
import { useContent } from "@/lib/contentStore";

export function FavoritesButton() {
  const { user } = useAuth();
  const { favorites, remove, loading } = useFavorites();
  const { colleges } = useContent();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link
        to="/auth"
        className="glass rounded-full px-4 py-2 text-xs font-medium flex items-center gap-2 hover:ring-1 hover:ring-primary/40 transition"
      >
        <Heart className="w-3.5 h-3.5" />
        Sign in to save favorites
      </Link>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="glass rounded-full px-4 py-2 text-xs font-medium flex items-center gap-2 hover:ring-1 hover:ring-primary/40 transition"
          aria-label="Open favorites"
        >
          <Heart className={`w-3.5 h-3.5 ${favorites.length ? "fill-primary text-primary" : ""}`} />
          Favorites
          <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
            {favorites.length}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <Heart className="w-5 h-5 fill-primary text-primary" />
            Your favorites
          </SheetTitle>
          <SheetDescription>
            Saved to your account — they'll be here next time you sign in.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 overflow-y-auto -mx-2 px-2">
          {loading && favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Heart className="w-8 h-8 mx-auto mb-3 opacity-40" />
              No favorites yet. Tap the heart on any college card to save it here.
            </div>
          ) : (
            <ul className="space-y-2">
              {favorites.map((f) => {
                const c = colleges.find((x) => x.id === f.college_id);
                return (
                  <li
                    key={f.id}
                    className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm leading-snug truncate">{f.college_name}</div>
                      {c && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {c.location}, {c.state}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {c?.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                          aria-label="Visit website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(f.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                        aria-label="Remove favorite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}