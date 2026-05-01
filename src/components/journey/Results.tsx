import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type College } from "@/lib/colleges";
import { useContent, trackEvent } from "@/lib/contentStore";
import { CollegeCard, CollegeCardSkeleton, type WhyMatch } from "./CollegeCard";
import { Sparkles, RotateCcw, Link2, Check, Undo2, Heart, Compass, MapPinned } from "lucide-react";

type Props = {
  feeling: string | null;
  direction: string | null;
  states: string[];
  loading: boolean;
  onRefine: () => void;
  onRestart: () => void;
};

const SECTION_META = {
  fit: {
    eyebrow: "Close to what you're looking for",
    title: "Feels right for you",
    desc: "These match your direction and the feeling you described.",
  },
  growth: {
    eyebrow: "Options you can grow into",
    title: "Aim a little higher",
    desc: "Top-tier paths worth stretching toward.",
  },
  explore: {
    eyebrow: "Other paths you might explore",
    title: "Worth a second look",
    desc: "Different in flavor, but quietly remarkable.",
  },
} as const;

function trackedRedirect(c: College) {
  trackEvent({ type: "click", collegeId: c.id, collegeName: c.name });
  setTimeout(() => window.open(c.website, "_blank", "noopener,noreferrer"), 80);
}

function MatchLegend() {
  const items = [
    { icon: Heart, label: "Feeling match", desc: "The college's vibe carries the energy you chose." },
    { icon: Compass, label: "Direction match", desc: "Offers the academic path you picked." },
    { icon: MapPinned, label: "State match", desc: "Located inside one of the states you selected." },
  ];
  return (
    <div className="glass rounded-2xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
      <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80">Card legend</span>
      {items.map(({ icon: Icon, label, desc }) => (
        <span key={label} className="flex items-center gap-1.5" title={desc}>
          <span className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <Icon className="w-2.5 h-2.5" />
          </span>
          <span className="text-foreground/80">{label}</span>
          <span className="hidden sm:inline text-muted-foreground/60">— {desc}</span>
        </span>
      ))}
      <span className="ml-auto text-[10px] italic text-muted-foreground/70">Tap any card's “Why it fits” to see your match breakdown.</span>
    </div>
  );
}

function buildWhyItFits(
  c: College,
  feeling: string | null,
  direction: string | null,
  states: string[],
  feelingLabel: string | null
): WhyMatch {
  const bits: string[] = [];
  const feelingMatched = !!(feeling && feelingLabel && c.vibe.includes(feeling));
  if (feelingMatched && feelingLabel) bits.push(`matches your love of ${feelingLabel.toLowerCase()}`);

  const dirTypeMap: Record<string, string[]> = {
    Technology: ["Engineering"],
    Medical: ["Medical"],
    Creative: ["Arts"],
    Business: ["Commerce"],
    Research: ["Engineering", "Others"],
    Exploring: ["Engineering", "Medical", "Arts", "Commerce", "Others"],
  };
  const directionMatched = !!(direction && (dirTypeMap[direction] ?? [direction]).includes(c.type));
  if (directionMatched && direction) bits.push(`a strong ${direction.toLowerCase()} path`);

  const stateMatched = states.includes(c.state);
  if (stateMatched) bits.push(`right inside ${c.state}`);
  else if (states.length > 0) bits.push(`outside your chosen states — kept for perspective`);

  let summary: string;
  if (bits.length === 0) {
    if (c.tier === "growth") summary = "A stretch goal worth aiming for.";
    else if (c.tier === "explore") summary = "A different flavor — worth a second look.";
    else summary = "Quietly aligned with what you described.";
  } else {
    summary = "Why it fits — " + bits.join(" · ");
  }

  return {
    summary,
    feeling: feeling
      ? {
          matched: feelingMatched,
          label: `Feeling: ${feelingLabel ?? feeling}`,
          detail: feelingMatched
            ? `This college's vibe carries the "${feelingLabel ?? feeling}" energy you chose.`
            : `Different vibe than "${feelingLabel ?? feeling}", but worth seeing for perspective.`,
        }
      : undefined,
    direction: direction
      ? {
          matched: directionMatched,
          label: `Direction: ${direction}`,
          detail: directionMatched
            ? `Offers a clear ${direction} path matching your direction.`
            : `Primarily ${c.type}, not ${direction} — included as a side door.`,
        }
      : undefined,
    state:
      states.length > 0
        ? {
            matched: stateMatched,
            label: `State: ${c.state}`,
            detail: stateMatched
              ? `Located in ${c.state}, one of the states you picked.`
              : `Outside your chosen states (${states.join(", ")}).`,
          }
        : undefined,
  };
}

export function Results({ feeling, direction, states, loading, onRefine, onRestart }: Props) {
  const [shown, setShown] = useState(10);
  const { colleges, settings, feelings } = useContent();
  const [copied, setCopied] = useState(false);

  // Snapshot the original journey selections so users can reset back after refining/loading more.
  const originalRef = useRef<{ feeling: string | null; direction: string | null; states: string[]; shown: number } | null>(null);
  if (originalRef.current === null && !loading) {
    originalRef.current = { feeling, direction, states: [...states], shown: 10 };
  }
  const original = originalRef.current;
  const isModified =
    !!original &&
    (original.feeling !== feeling ||
      original.direction !== direction ||
      original.states.join("|") !== states.join("|") ||
      original.shown !== shown);

  // Track share-link opens once per hydration.
  const sharedTracked = useRef(false);
  useEffect(() => {
    if (sharedTracked.current || typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("f") || sp.get("d") || sp.get("s")) {
      const src = sp.get("src");
      trackEvent({
        type: "share_open",
        collegeId: src && src.startsWith("sl-") ? src : "__share__",
        collegeName: src ? `Share link · ${src}` : "Share link opened",
      });
      sharedTracked.current = true;
    }
  }, []);

  const feelingLabel = useMemo(() => feelings.find((f) => f.id === feeling)?.label ?? null, [feelings, feeling]);

  // Map new direction labels to college types
  const directionTypeMap: Record<string, string[]> = {
    Technology: ["Engineering"],
    Medical: ["Medical"],
    Creative: ["Arts"],
    Business: ["Commerce"],
    Research: ["Engineering", "Others"],
    Exploring: ["Engineering", "Medical", "Arts", "Commerce", "Others"],
  };

  const filtered = useMemo(() => {
    let pool = colleges;
    if (direction) {
      const mapped = directionTypeMap[direction];
      if (mapped && !mapped.includes("Engineering") || (mapped && mapped.length < 5)) {
        pool = pool.filter((c) => mapped.includes(c.type));
      }
    }
    if (states.length > 0 && !settings.allowStateMismatch) {
      // STRICT: only colleges from the user's chosen state(s)
      pool = pool.filter((c) => states.includes(c.state));
    }
    if (feeling && feeling !== "unsure") {
      pool = [...pool].sort((a, b) => {
        const ai = a.vibe.includes(feeling) ? 0 : 1;
        const bi = b.vibe.includes(feeling) ? 0 : 1;
        return ai - bi;
      });
    }
    // Honor admin-defined order within tier
    pool = [...pool].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    return pool;
  }, [feeling, direction, states, colleges, settings.allowStateMismatch]);

  const visible = filtered.slice(0, shown);
  const sections = (["fit", "growth", "explore"] as const).map((tier) => ({
    tier,
    items: visible.filter((c) => c.tier === tier),
  }));

  // Track views once per visible set
  useEffect(() => {
    if (loading) return;
    visible.forEach((c) => trackEvent({ type: "view", collegeId: c.id, collegeName: c.name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, shown, filtered.length]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <CollegeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center glass rounded-3xl p-12 max-w-xl mx-auto">
        <div className="font-display text-3xl mb-3">Nothing close enough yet.</div>
        <p className="text-muted-foreground mb-6">
          Try expanding your states or changing the direction. The right path often hides one step away.
        </p>
        <button
          onClick={onRestart}
          className="rounded-full px-6 py-3 bg-primary text-primary-foreground font-medium"
        >
          Start over
        </button>
      </div>
    );
  }

  const copyShareLink = async () => {
    const params = new URLSearchParams();
    if (feeling) params.set("f", feeling);
    if (direction) params.set("d", direction);
    if (states.length) params.set("s", states.join("|"));
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="space-y-16">
      <MatchLegend />
      {sections.map(({ tier, items }, sIdx) =>
        items.length === 0 ? null : (
          <motion.section
            key={tier}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.15, duration: 0.7 }}
          >
            <div className="mb-8 max-w-2xl">
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
                {SECTION_META[tier].eyebrow}
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light leading-tight">
                {SECTION_META[tier].title}
              </h2>
              <p className="mt-2 text-muted-foreground">{SECTION_META[tier].desc}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {items.map((c, i) => (
                  <CollegeCard
                    key={c.id}
                    college={c}
                    index={i}
                    onVisit={trackedRedirect}
                    whyItFits={buildWhyItFits(c, feeling, direction, states, feelingLabel)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )
      )}

      <div className="flex flex-col items-center gap-4 pt-6">
        {shown < filtered.length && (
          <button
            onClick={() => setShown((n) => n + 10)}
            className="glass rounded-full px-8 py-3 text-sm font-medium hover:ring-1 hover:ring-primary/40 transition"
          >
            Load more
          </button>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={onRefine}
            className="rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 text-primary-foreground"
            style={{ background: "var(--gradient-aurora)" }}
          >
            <Sparkles className="w-4 h-4" />
            Help me narrow this down
          </button>
          {isModified && original && (
            <button
              onClick={() => {
                // Restore the original journey selections via a tiny custom event so the page can apply them.
                window.dispatchEvent(
                  new CustomEvent("xorb:reset-original", {
                    detail: { feeling: original.feeling, direction: original.direction, states: original.states },
                  })
                );
                setShown(original.shown);
              }}
              className="glass rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 hover:ring-1 hover:ring-primary/40 transition"
              title="Reset feeling, direction, states and pagination to your original journey"
            >
              <Undo2 className="w-4 h-4" />
              Reset to original
            </button>
          )}
          <button
            onClick={copyShareLink}
            className="glass rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 hover:ring-1 hover:ring-primary/40 transition"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
            {copied ? "Link copied — share it" : "Copy share link"}
          </button>
          <button
            onClick={onRestart}
            className="glass rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start a new journey
          </button>
        </div>
        <p className="text-xs text-muted-foreground/70 italic mt-2">
          You started unsure. Now you have somewhere to look.
        </p>
      </div>
    </div>
  );
}