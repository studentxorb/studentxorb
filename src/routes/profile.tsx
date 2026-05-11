import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Orb } from "@/components/Orb";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft, ExternalLink, GraduationCap, Heart, LogOut,
  Shield, Trash2, User, Settings, Check, X, Pencil, Lock
} from "lucide-react";
import { COLLEGES } from "@/lib/colleges";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: s.tab === "settings" ? "settings" : "profile",
  }),
  head: () => ({
    meta: [
      { title: "Your profile · Student X'Orb" },
      { name: "description", content: "Your saved colleges and account information." },
    ],
  }),
  component: ProfilePage,
});

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

function EditableField({
  label, value, placeholder, multiline = false, onSave,
}: {
  label: string; value: string; placeholder: string;
  multiline?: boolean; onSave: (val: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await onSave(draft.trim());
    setBusy(false);
    setEditing(false);
  };

  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className="group">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
      {editing ? (
        <div className="flex gap-2 items-start">
          {multiline ? (
            <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
              rows={3} placeholder={placeholder}
              className="flex-1 rounded-xl bg-foreground/6 border border-border/60 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/60 resize-none" />
          ) : (
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl bg-foreground/6 border border-border/60 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/60" />
          )}
          <div className="flex gap-1 mt-0.5">
            <button onClick={save} disabled={busy}
              className="rounded-lg p-1.5 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={cancel}
              className="rounded-lg p-1.5 bg-foreground/8 hover:bg-foreground/14 text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`text-sm flex-1 ${!value ? "text-muted-foreground italic" : ""}`}>
            {value || placeholder}
          </span>
          <button onClick={() => { setDraft(value); setEditing(true); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 hover:bg-foreground/8 text-muted-foreground">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { profile, loading: profileLoading, saving, update } = useProfile();
  const { favorites, remove, loading: favLoading } = useFavorites();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tab, setTab] = useState<"profile" | "settings">(search.tab as "profile" | "settings");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "?";

  const avatarColor = profile?.avatar_color ?? "#6366f1";

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error("Passwords don't match."); return; }
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setPwBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password: currentPw });
    if (signInError) { toast.error("Current password is incorrect."); setPwBusy(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { toast.error(error.message); } else {
      toast.success("Password updated successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    }
    setPwBusy(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40">
        <Orb hue={0.55} intensity={0.4} />
      </div>

      <div className="container mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header card */}
          <Card className="border-border/60 bg-card/60 p-8 backdrop-blur mb-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                style={{ background: avatarColor }}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">Your account</div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {profile?.full_name || user.email?.split("@")[0]}
                </h1>
                <div className="text-sm text-muted-foreground mt-0.5">{user.email}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={isAdmin ? "default" : "secondary"} className="gap-1">
                    {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {isAdmin ? "Admin" : "Student"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Heart className="h-3 w-3" /> {favorites.length} saved
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-foreground/5 w-fit">
            {(["profile", "settings"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {t === "profile"
                  ? <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Profile</span>
                  : <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Settings</span>}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-border/60 bg-card/60 p-6 backdrop-blur mb-6 space-y-6">
                <EditableField label="Display name" value={profile?.full_name ?? ""} placeholder="Add your name…"
                  onSave={(v) => update({ full_name: v || null })} />
                <EditableField label="Bio" value={profile?.bio ?? ""} placeholder="Tell us a bit about yourself…"
                  multiline onSave={(v) => update({ bio: v || null })} />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Avatar color</div>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map((color) => (
                      <button key={color} onClick={() => update({ avatar_color: color })}
                        className="w-8 h-8 rounded-full transition-transform hover:scale-110 relative"
                        style={{ background: color }}>
                        {avatarColor === color && <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                {saving && <div className="text-xs text-muted-foreground">Saving…</div>}
              </Card>

              <div className="mt-8 mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium tracking-tight">Your saved colleges</h2>
                <Link to="/" className="text-xs text-primary hover:underline">Find more →</Link>
              </div>

              {favLoading ? (
                <div className="text-sm text-muted-foreground">Loading favorites…</div>
              ) : favorites.length === 0 ? (
                <Card className="border-dashed border-border/60 bg-card/30 p-10 text-center">
                  <GraduationCap className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No saved colleges yet.</p>
                  <Link to="/onboarding"><Button className="mt-5">Start the journey</Button></Link>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {favorites.map((fav) => {
                    const college = COLLEGES.find((c) => c.id === fav.college_id);
                    return (
                      <Card key={fav.id} className="flex items-center justify-between gap-4 border-border/60 bg-card/60 p-4 backdrop-blur">
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{fav.college_name}</div>
                          {college && (
                            <div className="truncate text-xs text-muted-foreground">
                              {college.location} · {college.type} · {college.ownership}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {college?.website && (
                            <a href={college.website} target="_blank" rel="noreferrer"
                              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button onClick={() => remove(fav.id)}
                            className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Settings tab */}
          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">Change password</h3>
                </div>
                <form onSubmit={changePassword} className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-[0.2em] block mb-1">Current password</label>
                    <input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="Your current password"
                      className="w-full rounded-xl bg-foreground/6 border border-border/60 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/60" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-[0.2em] block mb-1">New password</label>
                    <input type="password" required minLength={6} value={newPw} onChange={(e) => setNewPw(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl bg-foreground/6 border border-border/60 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/60" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-[0.2em] block mb-1">Confirm new password</label>
                    <input type="password" required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-xl bg-foreground/6 border border-border/60 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/60" />
                  </div>
                  <Button type="submit" disabled={pwBusy} className="w-full mt-1">
                    {pwBusy ? "Updating…" : "Update password"}
                  </Button>
                </form>
              </Card>

              <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
                <h3 className="font-medium mb-4">Account info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-mono text-xs">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account ID</span>
                    <span className="font-mono text-xs text-muted-foreground">{user.id.slice(0, 8)}…</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant={isAdmin ? "default" : "secondary"} className="gap-1 text-xs">
                      {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {isAdmin ? "Admin" : "Student"}
                    </Badge>
                  </div>
                </div>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                Need to change your email? Contact support.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
