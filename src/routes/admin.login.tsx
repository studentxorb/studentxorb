import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminLogin, useIsAdmin, ADMIN_DEMO } from "@/lib/contentStore";
import { Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin · Student X'Orb" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const ok = useIsAdmin();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (ok) navigate({ to: "/admin" });
  }, [ok, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (adminLogin(u.trim(), p)) {
      navigate({ to: "/admin" });
    } else {
      setErr("Those credentials don't match. Try the demo ones below.");
    }
  };

  const fillDemo = () => {
    setU(ADMIN_DEMO.username);
    setP(ADMIN_DEMO.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-aurora)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "linear-gradient(135deg, oklch(0.74 0.18 330), oklch(0.78 0.14 200))" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-3xl p-10 max-w-md w-full relative z-10"
      >
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition">
          ← Back to journey
        </Link>

        <div className="mt-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
               style={{ background: "var(--gradient-aurora)" }}>
            <Lock className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-light">Admin access</h1>
            <p className="text-xs text-muted-foreground">Manage what students see.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Username
            </label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              autoComplete="username"
              className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60 transition"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              autoComplete="current-password"
              className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60 transition"
              placeholder="••••••••"
            />
          </div>

          {err && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full px-6 py-3 font-medium text-primary-foreground"
            style={{ background: "var(--gradient-aurora)" }}
          >
            Sign in
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-foreground/10">
          <div className="flex items-start gap-3 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground mb-1">Demo credentials</div>
              <div className="font-mono">admin / admin123</div>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2 text-primary hover:underline"
              >
                Auto-fill →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}