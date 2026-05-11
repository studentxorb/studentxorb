import { motion } from "framer-motion";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";

type Props = {
  value: string | null;
  onSelect: (id: string) => void;
};

const ICONS: Record<string, string> = {
  Engineering: "◇",
  Medical: "✚",
  Arts: "✦",
  Commerce: "◈",
  Others: "○",
};

export function DirectionStep({ value, onSelect }: Props) {
  const { directions } = useContent();
  return (
    <StepShell
      eyebrow="Step 02"
      title={
        <>
          Which <span className="font-display italic text-aurora">direction</span> calls you?
        </>
      }
      subtitle="Choose the field that excites you most right now."
      microcopy="Curiosity is enough. You don't need certainty yet."
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {directions.map((d, i) => {
          const active = value === d;
          return (
            <motion.button
              key={d}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              onClick={() => onSelect(d)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className={`glass rounded-2xl px-4 py-6 flex flex-col items-center gap-3 transition-all ${
                active
                  ? "ring-1 ring-primary/60 shadow-[0_20px_60px_-25px_oklch(0.78_0.14_200/0.5)]"
                  : "hover:ring-1 hover:ring-foreground/15"
              }`}
            >
              <span className="text-3xl text-aurora font-light">{ICONS[d] ?? "✧"}</span>
              <span className="text-sm font-medium text-foreground">{d}</span>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}