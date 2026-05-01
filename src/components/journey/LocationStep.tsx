import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";
import { X } from "lucide-react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  onContinue: () => void;
};

export function LocationStep({ value, onChange, onContinue }: Props) {
  const { states: STATES } = useContent();
  const toggle = (s: string) => {
    if (value.includes(s)) onChange(value.filter((x) => x !== s));
    else onChange([...value, s]);
  };

  return (
    <StepShell
      eyebrow="Step 03"
      title={
        <>
          Where would you{" "}
          <span className="font-display italic text-aurora">like to be</span>?
        </>
      }
      subtitle="Pick a few states. Skip if you're open to anywhere."
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

      <div className="glass rounded-3xl p-5">
        <div className="flex flex-wrap gap-2">
          {STATES.map((s) => {
            const active = value.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="relative group rounded-full px-10 py-4 font-medium text-primary-foreground overflow-hidden"
          style={{ background: "var(--gradient-aurora)" }}
        >
          <span className="relative z-10">
            {value.length === 0 ? "Show me everything →" : `Show me my matches →`}
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
               style={{ background: "linear-gradient(135deg, oklch(0.74 0.18 330), oklch(0.78 0.14 200))" }} />
        </motion.button>
      </div>
    </StepShell>
  );
}