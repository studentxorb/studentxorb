import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useContent,
  useIsAdmin,
  saveContent,
  resetContent,
  adminLogout,
  loadContent,
  useAnalytics,
  clearAnalytics,
  type Feeling,
} from "@/lib/contentStore";
import type { College } from "@/lib/colleges";
import { LogOut, Plus, Trash2, RotateCcw, Save, GraduationCap, Sparkles, Compass, MapPin, ExternalLink, Search, Download, Upload, BarChart3, FileSpreadsheet, Eye, MousePointerClick, GripVertical, Shield } from "lucide-react";
import { parseFile } from "@/lib/fileImport";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin Dashboard · Student X'Orb" }],
  }),
  component: AdminPage,
});

type Tab = "colleges" | "feelings" | "directions" | "states" | "import" | "analytics";

function AdminPage() {
  const navigate = useNavigate();
  const ok = useIsAdmin();
  const content = useContent();
  const [tab, setTab] = useState<Tab>("colleges");

  useEffect(() => {
    if (!ok) navigate({ to: "/admin/login" });
  }, [ok, navigate]);

  if (!ok) return null;

  const counts = {
    colleges: content.colleges.length,
    feelings: content.feelings.length,
    directions: content.directions.length,
    states: content.states.length,
    import: 0,
    analytics: 0,
  };

  return (
    <div className="min-h-screen relative">
      {/* Ambient backdrop */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "var(--gradient-aurora)" }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-10 py-6 flex items-center justify-between border-b border-foreground/5">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full relative" style={{ background: "var(--gradient-aurora)" }}>
              <div className="absolute inset-0.5 rounded-full bg-background/60 backdrop-blur-sm" />
              <div className="absolute inset-1.5 rounded-full" style={{ background: "var(--gradient-aurora)" }} />
            </div>
            <span className="font-display text-lg tracking-tight">
              Student <span className="italic text-aurora">X'Orb</span>
            </span>
          </Link>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          <button
            onClick={() => {
              if (confirm("Reset all content to defaults? This will discard your changes.")) {
                resetContent();
              }
            }}
            className="text-xs px-3 py-2 rounded-full glass hover:ring-1 hover:ring-foreground/20 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" /> Reset to defaults
          </button>
          <button
            onClick={() => {
              adminLogout();
              navigate({ to: "/admin/login" });
            }}
            className="text-xs px-3 py-2 rounded-full glass hover:ring-1 hover:ring-foreground/20 transition flex items-center gap-1.5"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </header>

      <main className="relative z-10 px-6 md:px-10 py-10 max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Content control room
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light leading-tight">
            What students see — <span className="italic text-aurora">you decide</span>.
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Every college, feeling, direction, and state below flows directly into the journey. Add, edit, or remove and watch the live experience update.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(
            [
              { id: "colleges", label: "Colleges", icon: GraduationCap },
              { id: "feelings", label: "Feelings", icon: Sparkles },
              { id: "directions", label: "Directions", icon: Compass },
              { id: "states", label: "States", icon: MapPin },
              { id: "import", label: "Import", icon: Upload },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                  active
                    ? "text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
                style={active ? { background: "var(--gradient-aurora)" } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {counts[t.id] > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-black/20" : "bg-foreground/10"}`}>
                    {counts[t.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tab === "colleges" && <CollegesPanel />}
            {tab === "feelings" && <FeelingsPanel />}
            {tab === "directions" && <DirectionsPanel />}
            {tab === "states" && <StatesPanel />}
            {tab === "import" && <ImportPanel />}
            {tab === "analytics" && <AnalyticsPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ----------------- Colleges ----------------- */

const EMPTY_COLLEGE: Omit<College, "id"> = {
  name: "",
  location: "",
  state: "",
  ownership: "Government",
  type: "Engineering",
  contextTag: "",
  website: "https://",
  tier: "fit",
  vibe: [],
};

function CollegesPanel() {
  const content = useContent();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<College | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return content.colleges;
    return content.colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }, [content.colleges, query]);

  const save = (c: College) => {
    const next = { ...content };
    const idx = next.colleges.findIndex((x) => x.id === c.id);
    if (idx >= 0) next.colleges[idx] = c;
    else next.colleges = [c, ...next.colleges];
    saveContent(next);
    setEditing(null);
    setCreating(false);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this college?")) return;
    saveContent({ ...content, colleges: content.colleges.filter((c) => c.id !== id) });
  };

  // Reorder within a tier; persists `order` field.
  const reorderInTier = (tier: College["tier"], fromId: string, toId: string) => {
    if (fromId === toId) return;
    const inTier = content.colleges
      .filter((c) => c.tier === tier)
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    const fromIdx = inTier.findIndex((c) => c.id === fromId);
    const toIdx = inTier.findIndex((c) => c.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const reordered = [...inTier];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const orderMap = new Map(reordered.map((c, i) => [c.id, i]));
    const next = {
      ...content,
      colleges: content.colleges.map((c) =>
        c.tier === tier ? { ...c, order: orderMap.get(c.id) ?? c.order } : c
      ),
    };
    saveContent(next);
    const tierLabel = tier === "fit" ? "Close to what you're looking for" : tier === "growth" ? "Options to grow into" : "Other paths to explore";
    setSavedToast(`✓ Saved new order for "${tierLabel}"`);
    window.setTimeout(() => setSavedToast((cur) => (cur && cur.includes(tierLabel) ? null : cur)), 2400);
  };

  const tierMeta: Record<College["tier"], { label: string; sub: string }> = {
    fit: { label: "Close to what you're looking for", sub: "Drag to reorder — top card shows first." },
    growth: { label: "Options to grow into", sub: "Stretch goals, ordered by you." },
    explore: { label: "Other paths to explore", sub: "Different flavors worth a second look." },
  };

  const grouped = (["fit", "growth", "explore"] as const).map((tier) => ({
    tier,
    items: filtered
      .filter((c) => c.tier === tier)
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
  }));

  return (
    <div>
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-5 py-2.5 text-sm flex items-center gap-2 shadow-lg ring-1 ring-primary/30"
          >
            <Save className="w-3.5 h-3.5 text-primary" />
            {savedToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search colleges, states, fields…"
            className="w-full glass rounded-full pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/60"
          />
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground flex items-center gap-2"
          style={{ background: "var(--gradient-aurora)" }}
        >
          <Plus className="w-4 h-4" /> Add college
        </button>
      </div>

      <div className="space-y-12">
        {grouped.map(({ tier, items }) => (
          <section key={tier}>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1">{tier}</div>
                <h3 className="font-display text-xl">{tierMeta[tier].label}</h3>
                <p className="text-xs text-muted-foreground">{tierMeta[tier].sub}</p>
              </div>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 glass rounded-2xl">No colleges in this tier.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => { setDragId(null); setOverId(null); }}
                    onDragOver={(e) => { e.preventDefault(); setOverId(c.id); }}
                    onDragLeave={() => setOverId((cur) => (cur === c.id ? null : cur))}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId) reorderInTier(tier, dragId, c.id);
                      setDragId(null);
                      setOverId(null);
                    }}
                    className={`glass rounded-2xl p-5 flex flex-col transition-all ${
                      dragId === c.id ? "opacity-40 scale-[0.98]" : ""
                    } ${overId === c.id && dragId !== c.id ? "ring-2 ring-primary/60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                        <div className="text-[10px] uppercase tracking-widest text-primary">{c.tier}</div>
                      </div>
                      <div className="flex gap-1">
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-foreground/10 transition"
                          title="Visit"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => remove(c.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="font-display text-lg leading-tight mb-1">{c.name}</div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {c.location}, {c.state} · {c.ownership} · {c.type}
                    </div>
                    <div className="text-sm text-foreground/80 italic mb-3 flex-1">"{c.contextTag}"</div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {c.vibe.map((v) => (
                        <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/[0.06] text-muted-foreground">
                          {v}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setEditing(c)}
                      className="text-xs px-3 py-1.5 rounded-full glass hover:ring-1 hover:ring-primary/40 self-start"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No colleges match "{query}".
          </div>
        )}
      </div>

      {(editing || creating) && (
        <CollegeEditor
          initial={editing ?? { id: `c-${Date.now()}`, ...EMPTY_COLLEGE }}
          isNew={creating}
          feelingIds={content.feelings.map((f) => f.id)}
          directions={content.directions}
          states={content.states}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}

function CollegeEditor({
  initial,
  isNew,
  feelingIds,
  directions,
  states,
  onCancel,
  onSave,
}: {
  initial: College;
  isNew: boolean;
  feelingIds: string[];
  directions: string[];
  states: string[];
  onCancel: () => void;
  onSave: (c: College) => void;
}) {
  const [c, setC] = useState<College>(initial);
  const set = <K extends keyof College>(k: K, v: College[K]) => setC((p) => ({ ...p, [k]: v }));

  const toggleVibe = (id: string) => {
    set("vibe", c.vibe.includes(id) ? c.vibe.filter((x) => x !== id) : [...c.vibe, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
          {isNew ? "New entry" : "Editing"}
        </div>
        <h2 className="font-display text-2xl font-light mb-6">
          {isNew ? "Add a college" : c.name || "Untitled"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" className="sm:col-span-2">
            <input value={c.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="City">
            <input value={c.location} onChange={(e) => set("location", e.target.value)} className={inputCls} />
          </Field>
          <Field label="State">
            <select value={c.state} onChange={(e) => set("state", e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={c.type} onChange={(e) => set("type", e.target.value as College["type"])} className={inputCls}>
              {directions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Ownership">
            <select value={c.ownership} onChange={(e) => set("ownership", e.target.value as College["ownership"])} className={inputCls}>
              {["Government", "Private", "Autonomous", "Deemed"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Tier">
            <select value={c.tier} onChange={(e) => set("tier", e.target.value as College["tier"])} className={inputCls}>
              <option value="fit">fit · feels right</option>
              <option value="growth">growth · stretch goal</option>
              <option value="explore">explore · second look</option>
            </select>
          </Field>
          <Field label="Website" className="sm:col-span-2">
            <input value={c.website} onChange={(e) => set("website", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Story tagline" className="sm:col-span-2">
            <input
              value={c.contextTag}
              onChange={(e) => set("contextTag", e.target.value)}
              placeholder="A short emotional line shown on the card"
              className={inputCls}
            />
          </Field>
          <Field label="Vibes (matches feelings)" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {feelingIds.map((id) => {
                const active = c.vibe.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleVibe(id)}
                    className={`px-3 py-1.5 rounded-full text-xs transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/[0.06] text-muted-foreground hover:bg-foreground/[0.1]"
                    }`}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-full text-sm glass">
            Cancel
          </button>
          <button
            onClick={() => onSave(c)}
            disabled={!c.name || !c.state}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-primary-foreground flex items-center gap-2 disabled:opacity-40"
            style={{ background: "var(--gradient-aurora)" }}
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const inputCls =
  "w-full glass rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/60 transition";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

/* ----------------- Feelings ----------------- */

function FeelingsPanel() {
  const content = useContent();
  const [draft, setDraft] = useState<Feeling>({ id: "", label: "", hint: "", hue: 0.5 });

  const update = (id: string, patch: Partial<Feeling>) => {
    const next = {
      ...content,
      feelings: content.feelings.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    };
    saveContent(next);
  };
  const remove = (id: string) => {
    if (!confirm("Remove this feeling?")) return;
    saveContent({ ...content, feelings: content.feelings.filter((f) => f.id !== id) });
  };
  const add = () => {
    if (!draft.id || !draft.label) return;
    if (content.feelings.some((f) => f.id === draft.id)) {
      alert("That id is already taken.");
      return;
    }
    saveContent({ ...content, feelings: [...content.feelings, draft] });
    setDraft({ id: "", label: "", hint: "", hue: 0.5 });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        {content.feelings.map((f) => (
          <div key={f.id} className="glass rounded-2xl p-5 relative overflow-hidden">
            <div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-30 blur-3xl"
              style={{ background: `oklch(0.78 0.18 ${f.hue * 360})` }}
            />
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/[0.06]">{f.id}</code>
                <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={f.label}
                onChange={(e) => update(f.id, { label: e.target.value })}
                className={`${inputCls} font-display text-lg`}
              />
              <input
                value={f.hint}
                onChange={(e) => update(f.id, { hint: e.target.value })}
                className={inputCls}
                placeholder="Short hint"
              />
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Hue · {f.hue.toFixed(2)}
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={f.hue}
                  onChange={(e) => update(f.id, { hue: parseFloat(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Add new feeling
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            placeholder="id (e.g. social)"
            value={draft.id}
            onChange={(e) => setDraft({ ...draft, id: e.target.value.replace(/\s+/g, "-").toLowerCase() })}
            className={inputCls}
          />
          <input
            placeholder="Label"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            className={`${inputCls} sm:col-span-2`}
          />
          <button
            onClick={add}
            className="rounded-full px-4 py-2 text-sm font-medium text-primary-foreground flex items-center justify-center gap-2"
            style={{ background: "var(--gradient-aurora)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <input
            placeholder="Hint"
            value={draft.hint}
            onChange={(e) => setDraft({ ...draft, hint: e.target.value })}
            className={`${inputCls} sm:col-span-4`}
          />
        </div>
      </div>
    </div>
  );
}

/* ----------------- Directions ----------------- */

function DirectionsPanel() {
  const content = useContent();
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || content.directions.includes(v)) return;
    saveContent({ ...content, directions: [...content.directions, v] });
    setDraft("");
  };
  const remove = (d: string) => {
    saveContent({ ...content, directions: content.directions.filter((x) => x !== d) });
  };

  return <SimpleListPanel items={content.directions} draft={draft} setDraft={setDraft} onAdd={add} onRemove={remove} placeholder="e.g. Design" />;
}

function StatesPanel() {
  const content = useContent();
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v || content.states.includes(v)) return;
    saveContent({ ...content, states: [...content.states, v].sort() });
    setDraft("");
  };
  const remove = (s: string) => {
    saveContent({ ...content, states: content.states.filter((x) => x !== s) });
  };

  const toggleOverride = () => {
    saveContent({
      ...content,
      settings: { ...content.settings, allowStateMismatch: !content.settings.allowStateMismatch },
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Show colleges even if state mismatches</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Off (default): if a student picks Andhra Pradesh, only Andhra colleges appear — never mixed.
            On: results may include colleges from other states for edge-case discovery.
          </p>
        </div>
        <button
          onClick={toggleOverride}
          aria-pressed={content.settings.allowStateMismatch}
          className={`relative w-12 h-7 rounded-full transition shrink-0 ${
            content.settings.allowStateMismatch ? "bg-primary" : "bg-foreground/15"
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-background shadow transition-all ${
              content.settings.allowStateMismatch ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
      <SimpleListPanel items={content.states} draft={draft} setDraft={setDraft} onAdd={add} onRemove={remove} placeholder="e.g. Goa" />
    </div>
  );
}

function SimpleListPanel({
  items, draft, setDraft, onAdd, onRemove, placeholder,
}: {
  items: string[];
  draft: string;
  setDraft: (s: string) => void;
  onAdd: () => void;
  onRemove: (s: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 flex gap-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder={placeholder}
          className={inputCls}
        />
        <button
          onClick={onAdd}
          className="rounded-full px-5 py-2 text-sm font-medium text-primary-foreground flex items-center gap-2 shrink-0"
          style={{ background: "var(--gradient-aurora)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <div key={s} className="glass rounded-full pl-4 pr-2 py-1.5 text-sm flex items-center gap-2 group">
            <span>{s}</span>
            <button
              onClick={() => onRemove(s)}
              className="p-1 rounded-full opacity-50 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground">Nothing yet — add your first one above.</div>}
      </div>
    </div>
  );
}

/* ----------------- Export / Import / Analytics ----------------- */

function ExportButton() {
  const exportAll = () => {
    const snap = loadContent();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xorb-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={exportAll}
      className="text-xs px-3 py-2 rounded-full glass hover:ring-1 hover:ring-foreground/20 transition flex items-center gap-1.5"
    >
      <Download className="w-3 h-3" /> Export JSON
    </button>
  );
}

function ImportPanel() {
  const content = useContent();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<College[] | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    setMessage(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      // JSON full snapshot import (with feelings/directions/states/colleges)
      if (ext === "json") {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data && typeof data === "object" && !Array.isArray(data) && (data.colleges || data.feelings || data.directions || data.states)) {
          const merge = mode === "merge";
          const mergedColleges = (() => {
            if (!data.colleges) return content.colleges;
            if (!merge) return data.colleges;
            const existing = new Set(content.colleges.map((c: College) => c.name.toLowerCase()));
            const fresh = (data.colleges as College[]).filter((c) => !existing.has(c.name.toLowerCase()));
            return [...fresh, ...content.colleges];
          })();
          const mergedFeelings = data.feelings
            ? merge
              ? [...content.feelings, ...data.feelings.filter((f: Feeling) => !content.feelings.some((x) => x.id === f.id))]
              : data.feelings
            : content.feelings;
          const mergedStates = data.states
            ? merge
              ? [...new Set([...content.states, ...data.states])].sort()
              : data.states
            : content.states;
          const mergedDirections = data.directions
            ? merge
              ? [...new Set([...content.directions, ...data.directions])]
              : data.directions
            : content.directions;
          const next = {
            colleges: mergedColleges,
            feelings: mergedFeelings,
            directions: mergedDirections,
            states: mergedStates,
            settings: { ...content.settings, ...(data.settings ?? {}) },
          };
          saveContent(next);
          setMessage(`✓ Imported snapshot (${mode}) — ${next.colleges.length} colleges, ${next.feelings.length} feelings, ${next.directions.length} directions, ${next.states.length} states.`);
          setBusy(false);
          return;
        }
      }
      const colleges = await parseFile(file);
      if (colleges.length === 0) {
        setMessage("Couldn't find any colleges in that file. Check column names like 'name', 'state', 'type'.");
      } else {
        setPreview(colleges);
        const sizeWarning = colleges.length > 5000
          ? ` ⚠️ Large dataset — only top 5,000 will be stored (localStorage limit). Consider using Supabase for full data.`
          : colleges.length > 3000
          ? ` ⚠️ Large dataset — storage may be limited to top 3,000 colleges.`
          : "";
        setMessage(`Found ${colleges.length} colleges. Review below and choose how to import.${sizeWarning}`);
      }
    } catch (e) {
      setMessage(`Error: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const commit = () => {
    if (!preview) return;
    const next = { ...content };
    if (mode === "replace") {
      next.colleges = preview;
    } else {
      const existing = new Set(content.colleges.map((c) => c.name.toLowerCase()));
      const fresh = preview.filter((c) => !existing.has(c.name.toLowerCase()));
      next.colleges = [...fresh, ...content.colleges];
    }
    // Auto-add new states & directions
    const newStates = new Set(content.states);
    const newDirs = new Set(content.directions);
    preview.forEach((c) => {
      if (c.state && c.state !== "—") newStates.add(c.state);
      if (c.type) newDirs.add(c.type);
    });
    next.states = [...newStates].sort();
    next.directions = [...newDirs];
    saveContent(next);
    setMessage(`✓ Imported ${preview.length} colleges (${mode}).`);
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Bulk import</div>
        <h2 className="font-display text-2xl mb-2">Drop a file. We'll convert it.</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Supported: <span className="text-foreground">.json, .csv, .xlsx, .xls, .pdf</span>. We map columns like <em>name, city, state, type, ownership, website, tagline, tier</em> automatically. JSON snapshots also restore feelings, directions, and states.
        </p>

        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className="text-muted-foreground">Import mode:</span>
          {(["merge", "replace"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-full transition ${
                mode === m ? "text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
              }`}
              style={mode === m ? { background: "var(--gradient-aurora)" } : undefined}
            >
              {m === "merge" ? "Merge (skip duplicates)" : "Replace existing"}
            </button>
          ))}
        </div>

        <label
          htmlFor="import-file"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`relative block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition overflow-hidden ${
            dragOver
              ? "border-primary bg-primary/[0.04] scale-[1.01]"
              : "border-foreground/15 hover:border-primary/60 hover:bg-foreground/[0.02]"
          }`}
        >
          {busy && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(110deg, transparent 30%, color-mix(in oklab, var(--primary) 18%, transparent) 50%, transparent 70%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            />
          )}
          <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-primary" />
          <div className="font-display text-lg mb-1">
            {busy ? "Parsing…" : dragOver ? "Release to upload" : "Click or drop a file"}
          </div>
          <div className="text-xs text-muted-foreground">JSON · CSV · Excel · PDF</div>
          <input
            id="import-file"
            type="file"
            accept=".json,.csv,.xlsx,.xls,.pdf,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm px-4 py-3 rounded-xl bg-foreground/5"
          >
            {message}
          </motion.div>
        )}
      </div>

      {preview && (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <div className="font-display text-xl">{preview.length} colleges ready</div>
              <div className="text-xs text-muted-foreground">Pick how to add them.</div>
            </div>
            <div className="flex gap-2">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "merge" | "replace")}
                className={inputCls + " w-auto"}
              >
                <option value="merge">Merge (skip duplicates)</option>
                <option value="replace">Replace all colleges</option>
              </select>
              <button
                onClick={commit}
                className="rounded-full px-5 py-2 text-sm font-medium text-primary-foreground"
                style={{ background: "var(--gradient-aurora)" }}
              >
                Confirm import
              </button>
              <button onClick={() => setPreview(null)} className="rounded-full px-4 py-2 text-sm glass">
                Cancel
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-foreground/5">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background/80 backdrop-blur">
                <tr className="text-left text-muted-foreground">
                  <th className="p-2">Name</th>
                  <th className="p-2">City</th>
                  <th className="p-2">State</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Tier</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 100).map((c) => (
                  <tr key={c.id} className="border-t border-foreground/5">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">{c.location}</td>
                    <td className="p-2">{c.state}</td>
                    <td className="p-2">{c.type}</td>
                    <td className="p-2">{c.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 100 && (
              <div className="p-3 text-center text-xs text-muted-foreground">
                + {preview.length - 100} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel() {
  const events = useAnalytics();

  return <AnalyticsPanelInner events={events} />;
}

function CountUp({ to, duration = 0.9 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{n.toLocaleString()}</>;
}

function AnalyticsPanelInner({ events }: { events: ReturnType<typeof useAnalytics> }) {

  const [csvStart, setCsvStart] = useState<string>("");
  const [csvEnd, setCsvEnd] = useState<string>("");
  const [csvType, setCsvType] = useState<"all" | "view" | "click" | "share_open">("all");

  const stats = useMemo(() => {
    const byCollege = new Map<string, { name: string; views: number; clicks: number }>();
    for (const e of events) {
      if (e.type === "share_open") continue;
      const cur = byCollege.get(e.collegeId) ?? { name: e.collegeName, views: 0, clicks: 0 };
      if (e.type === "view") cur.views++;
      else cur.clicks++;
      byCollege.set(e.collegeId, cur);
    }
    const rows = [...byCollege.entries()].map(([id, v]) => ({ id, ...v }));
    const topClicks = [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 10);
    const topViews = [...rows].sort((a, b) => b.views - a.views).slice(0, 10);
    const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
    const totalViews = rows.reduce((s, r) => s + r.views, 0);
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";
    const shareOpens = events.filter((e) => e.type === "share_open").length;
    return { topClicks, topViews, totalClicks, totalViews, ctr, uniqueCount: rows.length, shareOpens };
  }, [events]);

  const filteredCount = useMemo(() => {
    const startMs = csvStart ? new Date(csvStart + "T00:00:00").getTime() : -Infinity;
    const endMs = csvEnd ? new Date(csvEnd + "T23:59:59.999").getTime() : Infinity;
    return events.filter((e) => {
      if (e.ts < startMs || e.ts > endMs) return false;
      if (csvType !== "all" && e.type !== csvType) return false;
      return true;
    }).length;
  }, [events, csvStart, csvEnd, csvType]);

  const exportCsv = () => {
    const startMs = csvStart ? new Date(csvStart + "T00:00:00").getTime() : -Infinity;
    const endMs = csvEnd ? new Date(csvEnd + "T23:59:59.999").getTime() : Infinity;
    const filtered = events.filter((e) => {
      if (e.ts < startMs || e.ts > endMs) return false;
      if (csvType !== "all" && e.type !== csvType) return false;
      return true;
    });
    const header = ["timestamp", "iso", "type", "college_id", "college_name"];
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = filtered.map((e) =>
      [e.ts, new Date(e.ts).toISOString(), e.type, e.collegeId, e.collegeName]
        .map((v) => escape(String(v)))
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    const range = csvStart || csvEnd ? `_${csvStart || "start"}_to_${csvEnd || "end"}` : "";
    const t = csvType !== "all" ? `_${csvType}` : "";
    a.download = `xorb-analytics-${stamp}${range}${t}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { l: "Total views", v: stats.totalViews, i: Eye },
          { l: "Website clicks", v: stats.totalClicks, i: MousePointerClick },
          { l: "Click-through rate", v: stats.ctr + "%", i: BarChart3 },
          { l: "Colleges seen", v: stats.uniqueCount, i: GraduationCap },
        ].map((s, idx) => {
          const Icon = s.i;
          return (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-5 relative overflow-hidden group"
            >
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500"
                style={{ background: "var(--gradient-aurora)" }}
              />
              <Icon className="w-4 h-4 text-primary mb-3 relative" />
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground relative">{s.l}</div>
              <div className="font-display text-3xl mt-1 relative tabular-nums">
                {typeof s.v === "number" ? <CountUp to={s.v} /> : s.v}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AnalyticsTable
          title="Top click-throughs"
          eyebrow="Most-visited college websites"
          rows={stats.topClicks}
          metric="clicks"
        />
        <AnalyticsTable
          title="Most viewed"
          eyebrow="Surfaced in journey results"
          rows={stats.topViews}
          metric="views"
        />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1">CSV export</div>
            <div className="font-display text-lg">Filter events before download</div>
          </div>
          <div className="text-xs text-muted-foreground">
            {filteredCount} of {events.length} events match
            {stats.shareOpens > 0 && <> · {stats.shareOpens} share-link opens tracked</>}
          </div>
        </div>
        <div className="grid sm:grid-cols-4 gap-3 text-xs">
          <label className="space-y-1">
            <span className="text-muted-foreground">From</span>
            <input type="date" value={csvStart} onChange={(e) => setCsvStart(e.target.value)} className={inputCls} />
          </label>
          <label className="space-y-1">
            <span className="text-muted-foreground">To</span>
            <input type="date" value={csvEnd} onChange={(e) => setCsvEnd(e.target.value)} className={inputCls} />
          </label>
          <label className="space-y-1">
            <span className="text-muted-foreground">Event type</span>
            <select value={csvType} onChange={(e) => setCsvType(e.target.value as typeof csvType)} className={inputCls}>
              <option value="all">All events</option>
              <option value="view">Views only</option>
              <option value="click">Clicks only</option>
              <option value="share_open">Share-link opens</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={exportCsv}
              disabled={filteredCount === 0}
              className="w-full text-xs px-3 py-2.5 rounded-full text-primary-foreground flex items-center justify-center gap-1.5 disabled:opacity-40"
              style={{ background: "var(--gradient-aurora)" }}
            >
              <Download className="w-3 h-3" /> Export {filteredCount} rows
            </button>
          </div>
        </div>
        {(csvStart || csvEnd || csvType !== "all") && (
          <button
            onClick={() => { setCsvStart(""); setCsvEnd(""); setCsvType("all"); }}
            className="text-[11px] mt-3 text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => {
            if (confirm("Clear all analytics events?")) clearAnalytics();
          }}
          className="text-xs px-3 py-2 rounded-full glass hover:ring-1 hover:ring-destructive/40 hover:text-destructive transition flex items-center gap-1.5"
        >
          <Trash2 className="w-3 h-3" /> Clear analytics
        </button>
      </div>

      {events.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">
          No events yet. Start a journey on the homepage and the data will appear here.
        </div>
      )}
    </div>
  );
}

function AnalyticsTable({
  title, eyebrow, rows, metric,
}: {
  title: string;
  eyebrow: string;
  rows: { id: string; name: string; views: number; clicks: number }[];
  metric: "views" | "clicks";
}) {
  const max = Math.max(1, ...rows.map((r) => r[metric]));
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[10px] uppercase tracking-widest text-primary mb-1">{eyebrow}</div>
      <div className="font-display text-xl mb-4">{title}</div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4">No data yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="truncate pr-2">
                  <span className="text-muted-foreground tabular-nums mr-2">{i + 1}.</span>
                  {r.name}
                </span>
                <span className="font-medium tabular-nums">{r[metric]}</span>
              </div>
              <div className="h-1 rounded-full bg-foreground/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(r[metric] / max) * 100}%`, background: "var(--gradient-aurora)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}