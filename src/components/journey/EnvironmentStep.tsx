import { motion } from "framer-motion";
import { useState } from "react";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";

type Props = {
  value: string | null;
  onSelect: (envId: string, suggestedStates: string[]) => void;
};

export function EnvironmentStep({ value, onSelect }: Props) {
  const { environments } = useContent();
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <StepShell
      eyebrow="Step 02 · Environment"
      title={
        <>
          What kind of <span className="font-display italic text-aurora">environment</span> do you want around you?
        </>
      }
      subtitle="City, mountains, beaches, or something different — where you live shapes everything."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {environments.map((e, i) => {
          const active = value === e.id;
          const open = hovered === e.id;
          return (
            <motion.button
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              onClick={() => onSelect(e.id, e.states)}
              onMouseEnter={() => setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(e.id)}
              onBlur={() => setHovered(null)}
              whileHover={{ y: -2 }}
              className={`glass rounded-2xl p-5 text-left transition-all relative overflow-hidden ${
                active ? "ring-1 ring-primary/60" : "hover:ring-1 hover:ring-foreground/15"
              }`}
            >
              <div className="font-display text-base leading-snug">{e.label}</div>
              <motion.div
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="text-xs text-muted-foreground mt-2 italic">{e.hint}</div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}