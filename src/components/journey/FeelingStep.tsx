import { motion } from "framer-motion";
import { useState } from "react";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";

type Props = {
  value: string | null;
  onSelect: (id: string) => void;
};

export function FeelingStep({ value, onSelect }: Props) {
  const { feelings } = useContent();
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <StepShell
      eyebrow="Step 01 · Feeling"
      title={
        <>
          What kind of <span className="font-display italic text-aurora">life</span> do you want?
        </>
      }
      subtitle="Start with how you want to feel — everything builds from here. Hover any card to see more."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {feelings.map((f, i) => {
          const active = value === f.id;
          const open = hovered === f.id;
          return (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(f.id)}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(f.id)}
              onBlur={() => setHovered(null)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              className={`group glass rounded-2xl p-5 text-left transition-all duration-500 relative overflow-hidden ${
                active
                  ? "ring-1 ring-primary/60 shadow-[0_30px_80px_-20px_oklch(0.78_0.14_200/0.4)]"
                  : "hover:ring-1 hover:ring-foreground/15"
              }`}
            >
              <div
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                style={{ background: `oklch(0.78 0.18 ${f.hue * 360})` }}
              />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display text-lg font-light text-foreground leading-snug">
                  {f.label}
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="text-xs text-muted-foreground mt-2 italic">{f.hint}</div>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}