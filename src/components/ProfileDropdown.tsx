import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { User, Settings, LogOut, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileDropdown() {
  const { user, isAdmin, signOut } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "?";

  const displayName = profile?.full_name || user.email?.split("@")[0] || "You";
  const avatarColor = profile?.avatar_color ?? "#6366f1";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-foreground/8 transition-colors"
      >
        {/* Avatar circle */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
          style={{ background: avatarColor }}
        >
          {initials}
        </div>
        <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                  style={{ background: avatarColor }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                  <Shield className="w-3 h-3" /> Admin
                </div>
              )}
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/6 transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                View profile
              </Link>
              <Link
                to="/profile"
                search={{ tab: "settings" } as never}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/6 transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Edit profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/6 transition-colors"
                >
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Admin dashboard
                </Link>
              )}
            </div>

            <div className="border-t border-border/40 py-1.5">
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/8 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
