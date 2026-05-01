import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Sparkles, Heart, Compass, MapPinned, Info } from "lucide-react";
import { useState } from "react";
import type { College } from "@/lib/colleges";

export type WhyMatch = {
  summary: string;
  feeling?: { matched: boolean; label: string; detail: string };
  direction?: { matched: boolean; label: string; detail: string };
  state?: { matched: boolean; label: string; detail: string };
};

type Props = {
  college: College;
  index: number;
  onVisit: (c: College) => void;
  whyItFits?: WhyMatch;
};

export function CollegeCard({ college, index, onVisit, whyItFits }: Props) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass rounded-3xl p-6 flex flex-col gap-4 group relative overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-700 bg-primary" />

      <div className="flex items-start justify-between gap-3 relative">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">
            {college.contextTag}
          </div>
          <h3 className="font-display text-xl font-medium leading-snug text-foreground">
            {college.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-3.5 h-3.5" />
        <span>{college.location}, {college.state}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full bg-foreground/[0.06] text-muted-foreground">
          {college.ownership}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-foreground/[0.06] text-muted-foreground">
          {college.type}
        </span>
      </div>

      {whyItFits && (
        <div
          className="relative rounded-2xl text-xs leading-relaxed bg-gradient-to-br from-primary/[0.07] to-transparent border border-primary/10"
          onMouseEnter={() => !pinned && setOpen(true)}
          onMouseLeave={() => !pinned && setOpen(false)}
          onFocus={() => setOpen(true)}
        >
          <button
            type="button"
            onClick={() => {
              setPinned((p) => {
                const next = !p;
                setOpen(next);
                return next;
              });
            }}
            className="w-full text-left p-3 flex items-start gap-1.5 text-foreground/80"
            aria-expanded={open}
          >
            <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
            <span className="italic flex-1">{whyItFits.summary}</span>
            <Info className={`w-3 h-3 mt-0.5 shrink-0 transition ${open ? "text-primary" : "text-muted-foreground/60"}`} />
          </button>
          {open && (whyItFits.feeling || whyItFits.direction || whyItFits.state) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="border-t border-primary/10 px-3 py-2.5 space-y-1.5"
            >
              {whyItFits.feeling && (
                <MatchRow icon={Heart} matched={whyItFits.feeling.matched} label={whyItFits.feeling.label} detail={whyItFits.feeling.detail} />
              )}
              {whyItFits.direction && (
                <MatchRow icon={Compass} matched={whyItFits.direction.matched} label={whyItFits.direction.label} detail={whyItFits.direction.detail} />
              )}
              {whyItFits.state && (
                <MatchRow icon={MapPinned} matched={whyItFits.state.matched} label={whyItFits.state.label} detail={whyItFits.state.detail} />
              )}
            </motion.div>
          )}
        </div>
      )}

      <div className="mt-2 pt-4 border-t border-foreground/5">
        <button
          onClick={() => onVisit(college)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors group/btn"
        >
          Visit Website
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </div>
    </motion.article>
  );
}

function MatchRow({
  icon: Icon,
  matched,
  label,
  detail,
}: {
  icon: typeof Heart;
  matched: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span
        className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
          matched ? "bg-primary/20 text-primary" : "bg-foreground/10 text-muted-foreground/60"
        }`}
      >
        <Icon className="w-2.5 h-2.5" />
      </span>
      <div className="flex-1">
        <div className={`font-medium ${matched ? "text-foreground" : "text-muted-foreground"}`}>
          {label} {matched ? "· match" : "· no match"}
        </div>
        <div className="text-muted-foreground/80">{detail}</div>
      </div>
    </div>
  );
}

export function CollegeCardSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 flex flex-col gap-4">
      <div className="h-3 w-2/5 skeleton-shimmer rounded-full" />
      <div className="h-6 w-4/5 skeleton-shimmer rounded-md" />
      <div className="h-4 w-1/2 skeleton-shimmer rounded-full" />
      <div className="flex gap-2">
        <div className="h-6 w-20 skeleton-shimmer rounded-full" />
        <div className="h-6 w-24 skeleton-shimmer rounded-full" />
      </div>
      <div className="h-px bg-foreground/5 my-2" />
      <div className="h-4 w-32 skeleton-shimmer rounded-full" />
    </div>
  );
}