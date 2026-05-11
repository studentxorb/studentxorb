import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type College, getCollegeSegment, SEGMENT_META } from "@/lib/colleges";
import { useContent, trackEvent } from "@/lib/contentStore";
import { CollegeCard, CollegeCardSkeleton, type WhyMatch } from "./CollegeCard";
import { Sparkles, RotateCcw, Link2, Check, Undo2, Heart, Compass, MapPinned, Eraser } from "lucide-react";
import { FavoritesButton } from "./FavoritesButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const directionMatched = !!(direction && c.type === direction);
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
  const { colleges, settings, feelings } = useContent();
  const [copied, setCopied] = useState(false);

  const SEGMENT_STORAGE_KEY = "xorb:segmentTab";
  const SHOWN_STORAGE_KEY = "xorb:shownBySeg";
  const SCROLL_STORAGE_KEY = "xorb:scrollBySeg";

  const readJsonMap = (key: string): Record<string, number> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch { return {}; }
  };
  const writeJsonMap = (key: string, map: Record<string, number>) => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(key, JSON.stringify(map)); } catch { /* ignore */ }
  };

  const [activeSegment, setActiveSegmentState] = useState<"national" | "higher_ed" | "all">(() => {
    if (typeof window === "undefined") return "all";
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get("seg");
    if (fromUrl === "national" || fromUrl === "higher_ed" || fromUrl === "all") {
      try { window.localStorage.setItem(SEGMENT_STORAGE_KEY, fromUrl); } catch { /* ignore */ }
      return fromUrl;
    }
    const stored = window.localStorage.getItem(SEGMENT_STORAGE_KEY);
    return stored === "national" || stored === "higher_ed" || stored === "all" ? stored : "all";
  });

  const [shown, setShownState] = useState<number>(() => {
    const map = readJsonMap(SHOWN_STORAGE_KEY);
    const v = map[activeSegment];
    return typeof v === "number" && v >= 10 ? v : 10;
  });
  const setShown = (updater: number | ((n: number) => number)) => {
    setShownState((prev) => {
      const next = typeof updater === "function" ? (updater as (n: number) => number)(prev) : updater;
      const map = readJsonMap(SHOWN_STORAGE_KEY);
      map[activeSegment] = next;
      writeJsonMap(SHOWN_STORAGE_KEY, map);
      return next;
    });
  };

  const setActiveSegment = (s: "national" | "higher_ed" | "all") => {
    // Save current scroll (container-relative) for the outgoing segment.
    if (typeof window !== "undefined") {
      const scrollMap = readJsonMap(SCROLL_STORAGE_KEY);
      scrollMap[activeSegment] = getContainerScroll();
      writeJsonMap(SCROLL_STORAGE_KEY, scrollMap);
      try { window.localStorage.setItem(SEGMENT_STORAGE_KEY, s); } catch { /* ignore */ }
    }
    // Restore shown for the incoming segment.
    const shownMap = readJsonMap(SHOWN_STORAGE_KEY);
    const v = shownMap[s];
    setShownState(typeof v === "number" && v >= 10 ? v : 10);
    setActiveSegmentState(s);
    // Restore scroll for the incoming segment after paint (container-relative).
    if (typeof window !== "undefined") {
      const scrollMap = readJsonMap(SCROLL_STORAGE_KEY);
      const y = scrollMap[s] ?? 0;
      requestAnimationFrame(() => scrollContainerTo(y));
    }
  };

  const resetSegmentToDefault = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(SEGMENT_STORAGE_KEY);
        window.localStorage.removeItem(SHOWN_STORAGE_KEY);
        window.localStorage.removeItem(SCROLL_STORAGE_KEY);
      } catch { /* ignore */ }
    }
    setActiveSegmentState("all");
    setShownState(10);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => scrollContainerTo(0, "smooth"));
    }
  };

  // Container ref + helpers — track scroll relative to the Results container,
  // not the window, so restored positions stay accurate across layout shifts above.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const getContainerScroll = (): number => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, window.scrollY - top);
  };
  const scrollContainerTo = (y: number, behavior: ScrollBehavior = "auto") => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + y, behavior });
  };

  // Persist scroll for the active segment as the user scrolls (container-relative).
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const map = readJsonMap(SCROLL_STORAGE_KEY);
        map[activeSegment] = getContainerScroll();
        writeJsonMap(SCROLL_STORAGE_KEY, map);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [activeSegment]);

  // Restore scroll on initial load (after results render).
  const initialScrollRestored = useRef(false);
  useEffect(() => {
    if (initialScrollRestored.current || loading) return;
    initialScrollRestored.current = true;
    const map = readJsonMap(SCROLL_STORAGE_KEY);
    const y = map[activeSegment];
    if (typeof y === "number" && y > 0) {
      requestAnimationFrame(() => scrollContainerTo(y));
    }
  }, [loading, activeSegment]);

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

  const filtered = useMemo(() => {
    let pool = colleges;
    if (direction) pool = pool.filter((c) => c.type === direction);
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

  const visibleBySegment = useMemo(() => {
    const groups: Record<"national" | "higher_ed", College[]> = { national: [], higher_ed: [] };
    for (const c of visible) groups[getCollegeSegment(c)].push(c);
    return groups;
  }, [visible]);

  const segmentsOrder: Array<"national" | "higher_ed"> = ["national", "higher_ed"];
  const activeSegments = segmentsOrder.filter((s) => visibleBySegment[s].length > 0);

  // If the active segment becomes empty after filtering, fall back.
  useEffect(() => {
    if (activeSegment !== "all" && visibleBySegment[activeSegment].length === 0) {
      setActiveSegment("all");
    }
  }, [activeSegment, visibleBySegment]);

  const segmentsToRender: Array<"national" | "higher_ed"> =
    activeSegment === "all" ? activeSegments : [activeSegment];

  // Track views once per visible set
  useEffect(() => {
    if (loading) return;
    visible.forEach((c) => trackEvent({ type: "view", collegeId: c.id, collegeName: c.name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, shown, filtered.length]);

  if (loading) {
    return (
      <ResultsSkeleton />
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
    params.set("seg", activeSegment);
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
    <div ref={containerRef} className="space-y-16">
      <div className="flex justify-end">
        <FavoritesButton />
      </div>
      <MatchLegend />

      {activeSegments.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-foreground/[0.04] border border-foreground/10">
            <SegmentChip
              segmentKey="all"
              active={activeSegment === "all"}
              label={`All (${visible.length})`}
              onClick={() => setActiveSegment("all")}
            />
            {activeSegments.map((s) => (
              <SegmentChip
                key={s}
                segmentKey={s}
                active={activeSegment === s}
                label={`${SEGMENT_META[s].label} (${visibleBySegment[s].length})`}
                onClick={() => setActiveSegment(s)}
              />
            ))}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="ml-auto rounded-full px-3 py-1.5 text-[11px] font-medium flex items-center gap-1.5 text-muted-foreground hover:text-primary hover:ring-1 hover:ring-primary/40 transition border border-foreground/10"
                title="Reset segment tab, loaded count, and scroll"
              >
                <Eraser className="w-3 h-3" />
                Reset to default
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to default?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will switch back to the <strong>All</strong> segment, clear how many results
                  you've loaded per tab, and forget your saved scroll position. You can't undo this.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my view</AlertDialogCancel>
                <AlertDialogAction onClick={resetSegmentToDefault}>Yes, reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {segmentsToRender.map((seg, segIdx) => {
        const segItems = visibleBySegment[seg];
        const tierSections = (["fit", "growth", "explore"] as const).map((tier) => ({
          tier,
          items: segItems.filter((c) => c.tier === tier),
        }));
        return (
          <motion.div
            key={seg}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: segIdx * 0.1, duration: 0.6 }}
            className="space-y-12"
          >
            <div className="border-l-2 border-primary/40 pl-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-primary/80">
                {SEGMENT_META[seg].eyebrow}
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-light mt-1">
                {SEGMENT_META[seg].label}
                <span className="ml-2 text-base text-muted-foreground">· {segItems.length}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{SEGMENT_META[seg].desc}</p>
            </div>
            {tierSections.map(({ tier, items }, sIdx) =>
              items.length === 0 ? null : (
                <motion.section
                  key={tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sIdx * 0.1, duration: 0.6 }}
                >
                  <div className="mb-6 max-w-2xl">
                    <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">
                      {SECTION_META[tier].eyebrow}
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-light leading-tight">
                      {SECTION_META[tier].title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{SECTION_META[tier].desc}</p>
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
          </motion.div>
        );
      })}

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

function SegmentChip({
  active,
  label,
  onClick,
  segmentKey,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  segmentKey: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative isolate rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${
        active
          ? "text-primary-foreground"
          : "text-foreground/70 hover:text-primary"
      }`}
    >
      {active && (
        <motion.span
          layoutId={`segment-pill-${segmentKey ? "" : ""}active`}
          className="absolute inset-0 -z-10 rounded-full bg-primary shadow-[0_4px_18px_-6px_rgba(0,0,0,0.45)] ring-1 ring-primary/60"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="flex items-center gap-1.5">
        {active && (
          <motion.span
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full bg-primary-foreground/90"
          />
        )}
        {label}
      </span>
    </button>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-12 animate-fade-in">
      <div className="h-10 rounded-2xl bg-foreground/[0.04] border border-foreground/10" />
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-9 w-56 rounded-full bg-foreground/[0.06] border border-foreground/10" />
        <div className="ml-auto h-7 w-32 rounded-full bg-foreground/[0.04] border border-foreground/10" />
      </div>
      {[0, 1].map((seg) => (
        <div key={seg} className="space-y-6">
          <div className="border-l-2 border-primary/30 pl-4 space-y-2">
            <div className="h-2 w-24 rounded bg-primary/30" />
            <div className="h-7 w-64 rounded bg-foreground/10" />
            <div className="h-3 w-80 max-w-full rounded bg-foreground/[0.06]" />
          </div>
          <div>
            <div className="mb-5 space-y-2">
              <div className="h-2 w-32 rounded bg-primary/20" />
              <div className="h-6 w-56 rounded bg-foreground/10" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <CollegeCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}