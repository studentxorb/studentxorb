import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";
import { X, Search } from "lucide-react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  onContinue: () => void;
};

export function LocationStep({ value, onChange, onContinue, suggested = [] }: Props & { suggested?: string[] }) {
  const { states: STATES } = useContent();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const toggle = (s: string) => {
    if (value.includes(s)) onChange(value.filter((x) => x !== s));
    else onChange([...value, s]);
  };
  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    if (!lower) return STATES;
    return STATES.filter((s) => s.toLowerCase().includes(lower));
  }, [q, STATES]);
  const canContinue = value.length > 0;

  return (
    <StepShell
      eyebrow="Step 04 · Location"
      title={
        <>
          Where do you want to{" "}
          <span className="font-display italic text-aurora">wake up</span>?
        </>
      }
      subtitle="Pick at least one state. Type to search — picks below are suggested by your environment."
      microcopy="A change of scenery often opens new doors."
    >
      {/* Selected chips */}
      <div className="min-h-[60px] mb-6 flex flex-wrap gap-2 justify-center">
        <AnimatePresence>
          {value.map((s) => (
            <motion.button
              key={s}
              layout
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={() => toggle(s)}
              className="glass rounded-full pl-4 pr-2 py-1.5 text-sm flex items-center gap-2 ring-1 ring-primary/40 group"
            >
              <span>{s}</span>
              <span className="rounded-full p-1 group-hover:bg-foreground/10 transition">
                <X className="w-3 h-3" />
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="glass rounded-3xl p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Type a state…"
            className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary/60"
          />
          {open && q && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 left-0 right-0 max-h-64 overflow-y-auto glass rounded-xl p-1">
              {filtered.slice(0, 12).map((s) => (
                <button
                  key={s}
                  onClick={() => { toggle(s); setQ(""); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-foreground/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        {suggested.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-primary mb-2">Suggested by your environment</div>
            <div className="flex flex-wrap gap-2">
              {suggested.slice(0, 14).map((s) => {
                const active = value.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={`px-3 py-1.5 rounded-full text-xs transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.1] hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <motion.button
          whileHover={{ scale: canContinue ? 1.02 : 1 }}
          whileTap={{ scale: canContinue ? 0.97 : 1 }}
          onClick={() => canContinue && onContinue()}
          disabled={!canContinue}
          className="relative group rounded-full px-10 py-4 font-medium text-primary-foreground overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-aurora)" }}
        >
          <span className="relative z-10">
            {canContinue ? "Show me my matches →" : "Pick at least one state to continue"}
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ background: "linear-gradient(135deg, oklch(0.74 0.18 330), oklch(0.78 0.14 200))" }} />
        </motion.button>
      </div>
    </StepShell>
  );
}