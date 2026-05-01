import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";
import { X, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  onContinue: () => void;
};

export function LocationStep({ value, onChange, onContinue }: Props) {
  const { states: STATES } = useContent();
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const toggle = (s: string) => {
    if (value.includes(s)) onChange(value.filter((x) => x !== s));
    else onChange([...value, s]);
    setQuery("");
    setDropdownOpen(false);
    inputRef.current?.blur();
  };

  const filtered = STATES.filter(
    (s) =>
      s.toLowerCase().includes(query.toLowerCase()) && !value.includes(s)
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current &&
        !dropRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <StepShell
      eyebrow="Step 04 — Location"
      title={
        <>
          Where do you want to{" "}
          <span className="font-display italic text-aurora">wake up</span>?
        </>
      }
      subtitle="Choose places that match your lifestyle and energy."
      microcopy="Search and add states — at least one helps us curate better."
    >
      {/* Selected chips */}
      <div className="min-h-[52px] mb-4 flex flex-wrap gap-2">
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

      {/* Search dropdown */}
      <div className="relative" ref={dropRef}>
        <div className="glass rounded-2xl flex items-center gap-3 px-4 py-3 ring-1 ring-foreground/10 focus-within:ring-primary/40 transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search a state or union territory…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(""); setDropdownOpen(false); }}>
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {dropdownOpen && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute z-50 w-full mt-2 glass rounded-2xl overflow-hidden shadow-xl border border-foreground/10 max-h-64 overflow-y-auto"
            >
              {filtered.map((s) => (
                <button
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); toggle(s); }}
                  className="w-full text-left px-5 py-3 text-sm text-foreground hover:bg-primary/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {value.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground/60 text-center italic">
          Search and select at least one state to get better recommendations.
        </p>
      )}

      <div className="mt-8 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          disabled={value.length === 0}
          className="relative group rounded-full px-10 py-4 font-medium text-primary-foreground overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-aurora)" }}
        >
          <span className="relative z-10">
            {value.length === 0 ? "Select at least one state →" : `Show me my matches →`}
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ background: "linear-gradient(135deg, oklch(0.74 0.18 330), oklch(0.78 0.14 200))" }} />
        </motion.button>
      </div>
    </StepShell>
  );
}
