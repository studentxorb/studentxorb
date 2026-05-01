import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ArrowUpRight, MapPin, Trash2, BookmarkX } from "lucide-react";
import type { College } from "@/lib/colleges";
import { useContent } from "@/lib/contentStore";

// ── Storage helpers ────────────────────────────────────────
export function getFavouriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem("cc_favourites") ?? "[]");
  } catch {
    return [];
  }
}

export function setFavouriteIds(ids: string[]) {
  localStorage.setItem("cc_favourites", JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("cc:favourites_changed"));
}

export function toggleFavourite(id: string): boolean {
  const ids = getFavouriteIds();
  const idx = ids.indexOf(id);
  if (idx === -1) {
    ids.push(id);
    setFavouriteIds(ids);
    return true;
  } else {
    ids.splice(idx, 1);
    setFavouriteIds(ids);
    return false;
  }
}

export function isFavourite(id: string): boolean {
  return getFavouriteIds().includes(id);
}

// ── Floating trigger button ────────────────────────────────
export function FavouritesButton({ onClick }: { onClick: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getFavouriteIds().length);
    update();
    window.addEventListener("cc:favourites_changed", update);
    return () => window.removeEventListener("cc:favourites_changed", update);
  }, []);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`Open favourites (${count} saved)`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-white text-sm font-medium"
      style={{
        background: count > 0
          ? "linear-gradient(135deg, #ef4444 0%, #c026d3 100%)"
          : "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Heart
        className="w-4 h-4"
        fill={count > 0 ? "white" : "none"}
        stroke="white"
        strokeWidth={2}
      />
      <span>{count > 0 ? `${count} saved` : "Favourites"}</span>
    </motion.button>
  );
}

// ── Favourites drawer panel ────────────────────────────────
export function FavouritesPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { colleges } = useContent();
  const [favIds, setFavIds] = useState<string[]>([]);
  const [isSignedUp, setIsSignedUp] = useState(() => {
    try { return localStorage.getItem("cc_signedup") === "true"; } catch { return false; }
  });
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");

  const refresh = () => setFavIds(getFavouriteIds());

  useEffect(() => {
    refresh();
    window.addEventListener("cc:favourites_changed", refresh);
    return () => window.removeEventListener("cc:favourites_changed", refresh);
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim()) return;
    localStorage.setItem("cc_signedup", "true");
    setIsSignedUp(true);
  };

  const favColleges = favIds
    .map((id) => colleges.find((c) => c.id === id))
    .filter(Boolean) as College[];

  const remove = (id: string) => {
    toggleFavourite(id);
  };

  const clearAll = () => {
    setFavouriteIds([]);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 w-full max-w-sm flex flex-col"
            style={{
              background: "rgba(10, 8, 30, 0.95)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" fill="#f87171" stroke="#f87171" />
                <h2 className="font-display text-lg font-medium text-white">
                  Saved Colleges
                </h2>
                {favColleges.length > 0 && (
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                    {favColleges.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {favColleges.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-red-400 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {!isSignedUp ? (
              /* ── Signup gate ── */
              <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-10 px-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:"linear-gradient(135deg,#ef4444,#c026d3)"}}>
                  <Heart className="w-7 h-7 text-white" fill="white" />
                </div>
                <div>
                  <p className="text-foreground font-display text-xl font-medium mb-2">Sign in to view your saved colleges</p>
                  <p className="text-sm text-muted-foreground">Your favourites are saved — sign up free to access them anytime.</p>
                </div>
                <form onSubmit={handleSignup} className="w-full flex flex-col gap-3">
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your name" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/40 bg-transparent text-foreground placeholder:text-muted-foreground/50 w-full"/>
                  <input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="your@email.com" className="glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/40 bg-transparent text-foreground placeholder:text-muted-foreground/50 w-full"/>
                  <button type="submit" className="rounded-xl py-3 font-medium text-white text-sm w-full" style={{background:"linear-gradient(135deg,#ef4444,#c026d3)"}}>Sign up free & view favourites</button>
                </form>
                <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition">Maybe later</button>
              </div>
            ) : favColleges.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <BookmarkX className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium mb-1">No saved colleges yet</p>
                    <p className="text-sm text-muted-foreground">
                      Tap the ♥ on any college card to save it here
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {favColleges.map((college, i) => (
                    <motion.div
                      key={college.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="rounded-2xl p-4 flex flex-col gap-2 group"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-1 truncate">
                            {college.contextTag}
                          </p>
                          <h3 className="text-sm font-medium text-white leading-snug">
                            {college.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => remove(college.id)}
                          aria-label="Remove from favourites"
                          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-500/20 transition"
                        >
                          <Heart
                            className="w-3.5 h-3.5 text-red-400"
                            fill="#f87171"
                            stroke="#f87171"
                          />
                        </button>
                      </div>

                      {/* Location row */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{college.location}, {college.state}</span>
                      </div>

                      {/* Tags row */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground">
                          {college.ownership}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground">
                          {college.type}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            college.tier === "fit"
                              ? "bg-green-500/15 text-green-400"
                              : college.tier === "growth"
                              ? "bg-purple-500/15 text-purple-400"
                              : "bg-blue-500/15 text-blue-400"
                          }`}
                        >
                          {college.tier === "fit" ? "Best fit" : college.tier === "growth" ? "Stretch" : "Explore"}
                        </span>
                      </div>

                      {/* Visit link */}
                      <a
                        href={college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition mt-1 w-fit"
                      >
                        Visit website
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {favColleges.length > 0 && (
              <div className="px-6 py-4 border-t border-white/8">
                <p className="text-xs text-muted-foreground text-center">
                  Saved to this device · clears when you clear browser data
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
