import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminLogin, useIsAdmin } from "@/lib/contentStore";
import { Lock, UserCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Sign In · Campus Compass" }] }),
  component: LoginPage,
});

type Mode = "user" | "admin";

function LoginPage() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [mode, setMode] = useState<Mode>("user");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate({ to: "/admin" });
  }, [isAdmin, navigate]);

  const alreadySignedUp = (() => {
    try { return localStorage.getItem("cc_signedup") === "true"; } catch { return false; }
  })();

  const storedName = (() => {
    try { return localStorage.getItem("cc_name") || localStorage.getItem("cc_email") || ""; } catch { return ""; }
  })();

  const submitUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) { setErr("Please enter your email."); return; }
    localStorage.setItem("cc_signedup", "true");
    localStorage.setItem("cc_email", email.trim());
    if (name.trim()) localStorage.setItem("cc_name", name.trim());
    setUserSuccess(true);
    setTimeout(() => navigate({ to: "/" }), 1200);
  };

  const submitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (adminLogin(adminEmail.trim(), adminPass)) {
      navigate({ to: "/admin" });
    } else {
      setErr("Incorrect email or password. Please try again.");
    }
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
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-3xl p-10 max-w-md w-full relative z-10"
      >
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition">
          ← Back to journey
        </Link>

        {/* Mode tabs */}
        <div className="mt-6 flex gap-1 p-1 glass rounded-xl mb-8">
          <button
            onClick={() => { setMode("user"); setErr(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "user" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <UserCircle className="w-4 h-4 inline mr-1.5" />
            Sign up / Sign in
          </button>
          <button
            onClick={() => { setMode("admin"); setErr(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Lock className="w-4 h-4 inline mr-1.5" />
            Admin
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "user" ? (
            <motion.div key="user" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {userSuccess ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-display text-xl font-light">
                    Welcome{name.trim() ? `, ${name.trim()}` : ""}!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Taking you back to your journey…</p>
                </div>
              ) : alreadySignedUp ? (
                <div className="space-y-4">
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-light">
                      Welcome back{storedName ? `, ${storedName.split("@")[0]}` : ""}!
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">You're already signed in.</p>
                  </div>
                  <Link to="/" className="block w-full rounded-full px-6 py-3 font-medium text-primary-foreground text-center"
                    style={{ background: "var(--gradient-aurora)" }}>
                    Continue your journey <ArrowRight className="w-4 h-4 inline ml-1" />
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("cc_signedup");
                      localStorage.removeItem("cc_email");
                      localStorage.removeItem("cc_name");
                      window.location.reload();
                    }}
                    className="block w-full text-xs text-muted-foreground hover:text-foreground transition text-center mt-2"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <form onSubmit={submitUser} className="space-y-4">
                  <div>
                    <h1 className="font-display text-2xl font-light mb-1">Create your free account</h1>
                    <p className="text-sm text-muted-foreground">Save favourites, unlock all results, and track your journey.</p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Your name (optional)</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60 transition bg-transparent"
                      placeholder="e.g. Venkat" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Email *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60 transition bg-transparent"
                      placeholder="your@email.com" />
                  </div>
                  {err && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</div>}
                  <button type="submit" className="w-full rounded-full px-6 py-3 font-medium text-primary-foreground"
                    style={{ background: "var(--gradient-aurora)" }}>
                    Sign up free
                  </button>
                  <p className="text-xs text-muted-foreground text-center">No spam. No passwords. Just your journey.</p>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-light">Admin access</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage colleges, analytics, and content.</p>
              </div>
              <form onSubmit={submitAdmin} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    autoComplete="username"
                    className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60 transition bg-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Password</label>
                  <input
                    type="password"
                    required
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    autoComplete="current-password"
                    className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60 transition bg-transparent"
                    placeholder="••••••••"
                  />
                </div>
                {err && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</div>}
                <button type="submit" className="w-full rounded-full px-6 py-3 font-medium text-primary-foreground"
                  style={{ background: "var(--gradient-aurora)" }}>
                  Sign in to Admin
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
