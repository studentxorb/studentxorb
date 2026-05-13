import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/",
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({ meta: [{ title: "Sign in · Student X'Orb" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode as "signin" | "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    // Admin email gets routed to /admin, regular users to redirect target
    if (isAdmin) navigate({ to: "/admin" });
    else navigate({ to: search.redirect || "/" });
  }, [user, isAdmin, loading, navigate, search.redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, username } },
        });
        if (error) throw error;
        // Auto sign in immediately after signup (requires email confirmation disabled in Supabase)
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        toast.success("Welcome! Your account is ready.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${search.redirect || "/"}` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-aurora)" }} />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "linear-gradient(135deg, oklch(0.74 0.18 330), oklch(0.78 0.14 200))" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9 }}
        className="glass rounded-3xl p-10 max-w-md w-full relative z-10"
      >
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition">
          ← Back to journey
        </Link>

        <div className="mt-6 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-aurora)" }}>
            <Lock className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-light">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "signin" ? "Sign in to access your saved colleges." : "Join to save your shortlist and pick up where you left off."}
            </p>
          </div>
        </div>

        <button
          onClick={google}
          className="w-full glass rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 hover:ring-1 hover:ring-primary/40 mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" opacity=".8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>
          {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
        </button>

        <div className="flex items-center gap-3 my-4 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="flex-1 h-px bg-foreground/10" /> or with email <div className="flex-1 h-px bg-foreground/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="Username (e.g. rahul23)"
                required
                minLength={3}
                className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60"
              />
            </>
          )}
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full px-6 py-3 font-medium text-primary-foreground disabled:opacity-50"
            style={{ background: "var(--gradient-aurora)" }}
          >
            {busy ? "…" : mode === "signin" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary hover:underline font-medium"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}