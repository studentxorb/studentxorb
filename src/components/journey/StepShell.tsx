import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  microcopy?: string;
  children: ReactNode;
};

export function StepShell({ eyebrow, title, subtitle, microcopy, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="text-center mb-10">
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-light leading-[1.05] tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children}
      {microcopy && (
        <p className="mt-10 text-center text-xs text-muted-foreground/70 italic">
          {microcopy}
        </p>
      )}
    </motion.div>
  );
}