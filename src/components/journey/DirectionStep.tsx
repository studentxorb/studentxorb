import { motion } from "framer-motion";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";

type Props = {
  value: string | null;
  onSelect: (id: string) => void;
};

const DIRECTION_META: Record<string, { icon: string; subtitle: string }> = {
  Technology: { icon: "◇", subtitle: "Build, code, innovate" },
  Medical: { icon: "✚", subtitle: "Heal, care, discover life sciences" },
  Creative: { icon: "✦", subtitle: "Design, express, create ideas" },
  Business: { icon: "◈", subtitle: "Lead, manage, grow ventures" },
  Research: { icon: "◎", subtitle: "Explore, experiment, discover" },
  Exploring: { icon: "○", subtitle: "Find your path step by step" },
};

export function DirectionStep({ value, onSelect }: Props) {
  const { directions } = useContent();
  return (
    <StepShell
      eyebrow="Step 03 — Direction"
      title={
        <>
          What kind of <span className="font-display italic text-aurora">future excites you</span> right now?
        </>
      }
      subtitle="Pick what pulls you forward — you can refine later."
      microcopy="Curiosity is enough. You don't need certainty yet."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {directions.map((d, i) => {
          const active = value === d;
          const meta = DIRECTION_META[d] ?? { icon: "✧", subtitle: "" };
          return (
            <motion.button
              key={d}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              onClick={() => onSelect(d)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className={`glass rounded-2xl px-4 py-6 flex flex-col items-center gap-2 transition-all ${
                active
                  ? "ring-1 ring-primary/60 shadow-[0_20px_60px_-25px_oklch(0.78_0.14_200/0.5)]"
                  : "hover:ring-1 hover:ring-foreground/15"
              }`}
            >
              <span className="text-3xl text-aurora font-light">{meta.icon}</span>
              <span className="text-sm font-medium text-foreground">{d}</span>
              <span className="text-xs text-muted-foreground italic text-center">{meta.subtitle}</span>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}
