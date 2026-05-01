import { motion } from "framer-motion";
import { useContent } from "@/lib/contentStore";
import { StepShell } from "./StepShell";

type Props = {
  value: string | null;
  onSelect: (id: string) => void;
};

export function FeelingStep({ value, onSelect }: Props) {
  const { feelings } = useContent();
  return (
    <StepShell
      eyebrow="Step 01"
      title={
        <>
          What does your{" "}
          <span className="font-display italic text-aurora">ideal college life</span>{" "}
          feel like?
        </>
      }
      subtitle="Pick the feeling that comes first. Don't overthink it."
      microcopy="You can change this anytime. There is no single right path."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {feelings.map((f, i) => {
          const active = value === f.id;
          return (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(f.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className={`group glass rounded-3xl p-6 text-left transition-all duration-500 relative overflow-hidden ${
                active
                  ? "ring-1 ring-primary/60 shadow-[0_30px_80px_-20px_oklch(0.78_0.14_200/0.4)]"
                  : "hover:ring-1 hover:ring-foreground/15"
              }`}
            >
              <div
                className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                style={{ background: `oklch(0.78 0.18 ${f.hue * 360})` }}
              />
              <div className="relative">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display text-2xl font-light text-foreground leading-snug mb-2">
                  {f.label}
                </div>
                <div className="text-sm text-muted-foreground">{f.hint}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}