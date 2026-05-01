import { motion } from "framer-motion";
import { StepShell } from "./StepShell";
import { useState } from "react";

type Props = {
  value: string | null;
  onSelect: (id: string) => void;
};

const ENVIRONMENTS = [
  // Lifestyle & Surroundings
  { id: "BEACH_CHILL", label: "Beach & Chill", hint: "I want to be close to beaches and relaxed coastal vibes", hue: 200 },
  { id: "CITY_OPP", label: "City Life & Opportunities", hint: "I want to be in a busy, happening city", hue: 260 },
  { id: "NATURE_PEACE", label: "Nature & Peaceful", hint: "I want beautiful surroundings and natural landscapes", hue: 145 },
  { id: "MOUNTAIN_ADV", label: "Mountains & Adventure", hint: "I love hills, trekking, and cool climates", hue: 170 },
  { id: "CREATIVE_CULTURE", label: "Creative & Cultural", hint: "I want a place with art, ideas, and cultural richness", hue: 330 },
  { id: "STARTUP_GROWTH", label: "Startup & Growth", hint: "I want to be around innovation and new ideas", hue: 290 },
  { id: "PRACTICAL_EXP", label: "Practical Exposure", hint: "I want real-world, hands-on surroundings", hue: 55 },
  { id: "UNIQUE_EXP", label: "Unique Experience", hint: "I want something different from typical college life", hue: 320 },
];

export function EnvironmentStep({ value, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <StepShell
      eyebrow="Step 02 — Environment"
      title={
        <>
          What kind of{" "}
          <span className="font-display italic text-aurora">environment</span> do you want around you?
        </>
      }
      subtitle="City, mountains, beaches, or something different — where you live shapes everything."
      microcopy="Don't display state names — they're used for matching behind the scenes."
    >
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {ENVIRONMENTS.map((env, i) => {
          const active = value === env.id;
          const hovered = hoveredId === env.id;
          return (
            <motion.button
              key={env.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(env.id)}
              onMouseEnter={() => setHoveredId(env.id)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className={`group glass rounded-3xl p-5 text-left transition-all duration-500 relative overflow-hidden ${
                active
                  ? "ring-1 ring-primary/60 shadow-[0_30px_80px_-20px_oklch(0.78_0.14_200/0.4)]"
                  : "hover:ring-1 hover:ring-foreground/15"
              }`}
            >
              <div
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-50"
                style={{ background: `oklch(0.78 0.18 ${env.hue})` }}
              />
              <div className="relative">
                <div className="font-display text-base font-light text-foreground leading-snug mb-2">
                  {env.label}
                </div>
                <motion.div
                  initial={false}
                  animate={{ opacity: hovered || active ? 1 : 0, y: hovered || active ? 0 : 4 }}
                  transition={{ duration: 0.22 }}
                  className="text-xs text-muted-foreground italic"
                >
                  {env.hint}
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}
