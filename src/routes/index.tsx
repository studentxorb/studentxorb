import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Orb } from "@/components/Orb";
import { FeelingStep } from "@/components/journey/FeelingStep";
import { EnvironmentStep } from "@/components/journey/EnvironmentStep";
import { FavouritesButton, FavouritesPanel } from "@/components/FavouritesPanel";
import { DirectionStep } from "@/components/journey/DirectionStep";
import { LocationStep } from "@/components/journey/LocationStep";
import { Transition } from "@/components/journey/Transition";
import { Results } from "@/components/journey/Results";
import { FEELINGS } from "@/lib/colleges";
import { Sparkles, Compass, MapPin, Heart, Users, ShieldCheck, ArrowRight, GraduationCap, Globe, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student X'Orb — From uncertainty to clarity" },
      {
        name: "description",
        content:
          "A guided, conversational journey to discover the college that fits the life you want — not just the marks you have.",
      },
      { property: "og:title", content: "Student X'Orb — From uncertainty to clarity" },
      {
        property: "og:description",
        content: "An emotionally intelligent way to choose your college.",
      },
    ],
  }),
  component: Index,
});

type Step =
  | "intro"
  | "feeling"
  | "transition1"
  | "environment"
  | "direction"
  | "location"
  | "loading"
  | "results";

const TRANSITIONS: Record<string, string> = {
  transition1: "Nice. Now let's find your ideal environment.",
};

// Auth gate modal for favorites
function HeaderAuthButtons({ onAuth }: { onAuth: () => void }) {
  const signedUp = (() => { try { return localStorage.getItem("cc_signedup") === "true"; } catch { return false; } })();
  const name = (() => { try { return localStorage.getItem("cc_name") || localStorage.getItem("cc_email") || ""; } catch { return ""; } })();
  if (signedUp) {
    return (
      <span className="text-xs text-muted-foreground hidden sm:inline">
        Hi, {name ? name.split("@")[0] : "you"} ??
      </span>
    );
  }
  return (
    <button
      onClick={onAuth}
      className="text-xs text-muted-foreground hover:text-foreground transition hidden sm:inline"
    >
      Sign in
    </button>
  );
}

function AuthGateModal({ onClose, navigate }: { onClose: () => void; navigate: (opts: { to: string }) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--gradient-aurora)" }}>
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display text-2xl mb-2">Save your favourites</h2>
          <p className="text-sm text-muted-foreground">Sign in or create an account to view and save your favourite colleges.</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onClose(); navigate({ to: "/admin/login" }); }} className="rounded-full py-3 font-medium text-primary-foreground w-full"
            style={{ background: "var(--gradient-aurora)" }}
          >
            Sign Up
          </button>
          <button
            onClick={() => { onClose(); navigate({ to: "/admin/login" }); }} className="rounded-full py-3 font-medium text-foreground w-full glass ring-1 ring-foreground/10 hover:ring-foreground/20 transition"
          >
            Sign In
          </button>
          <button onClick={onClose} className="text-xs text-muted-foreground mt-1 hover:text-foreground transition">
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Index() {
  const [step, setStep] = useState<Step>("intro");
  const [feeling, setFeeling] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<string | null>(null);
  const [favOpen, setFavOpen] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const navigate = useNavigate();

  // Hydrate from share link
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const f = sp.get("f");
    const d = sp.get("d");
    const s = sp.get("s");
    if (f || d || s) {
      if (f) setFeeling(f);
      if (d) setDirection(d);
      if (s) setStates(s.split("|").filter(Boolean));
      setStep("results");
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { feeling: string | null; direction: string | null; states: string[] }
        | undefined;
      if (!detail) return;
      setFeeling(detail.feeling);
      setDirection(detail.direction);
      setStates(detail.states);
      setStep("results");
    };
    window.addEventListener("xorb:reset-original", handler);
    return () => window.removeEventListener("xorb:reset-original", handler);
  }, []);

  const orbHue = useMemo(() => {
    const f = FEELINGS.find((x) => x.id === feeling);
    return f?.hue ?? 0.55;
  }, [feeling]);

  const orbIntensity = useMemo(() => {
    let n = 0.3;
    if (feeling) n += 0.1;
    if (environment) n += 0.1;
    if (direction) n += 0.1;
    if (states.length > 0) n += 0.15;
    if (step === "results") n += 0.15;
    return Math.min(n, 1);
  }, [feeling, environment, direction, states, step]);

  useEffect(() => {
    if (step === "transition1") {
      const t = setTimeout(() => setStep("environment"), 1900);
      return () => clearTimeout(t);
    }
    if (step === "loading") {
      const t = setTimeout(() => setStep("results"), 1100);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleFeeling = (id: string) => {
    setFeeling(id);
    setTimeout(() => setStep("transition1"), 350);
  };

  const handleEnvironment = (id: string) => {
    setEnvironment(id);
    setTimeout(() => setStep("direction"), 400);
  };

  const handleDirection = (d: string) => {
    setDirection(d);
    setTimeout(() => setStep("location"), 400);
  };

  const handleLocationContinue = () => setStep("loading");

  const restart = () => {
    setFeeling(null);
    setEnvironment(null);
    setDirection(null);
    setStates([]);
    setStep("intro");
  };

  const refine = () => setStep("feeling");

  // 6-step progress: feeling, environment, direction, location, explore, shortlist
  const STEP_ORDER: Step[] = ["intro", "feeling", "environment", "direction", "location", "loading", "results"];
  const stepIndex = STEP_ORDER.indexOf(
    step === "transition1" ? "feeling" : step
  );

  const beginJourney = () => {
    setStep("feeling");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Auth gate */}
      <AnimatePresence>
        {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} navigate={navigate} />}
      </AnimatePresence>

      {/* Top nav */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 md:px-10 py-5 flex items-center justify-between">
        <button onClick={restart} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-full relative" style={{ background: "var(--gradient-aurora)" }}>
            <div className="absolute inset-0.5 rounded-full bg-background/60 backdrop-blur-sm" />
            <div className="absolute inset-1.5 rounded-full" style={{ background: "var(--gradient-aurora)" }} />
          </div>
          <span className="font-display text-lg tracking-tight">
            Student <span className="italic text-aurora">X'Orb</span>
          </span>
        </button>

        {step !== "intro" && (
          <div className="hidden md:flex items-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-700 ${
                  i < stepIndex ? "w-8 bg-primary" : i === stepIndex ? "w-10 bg-primary/70" : "w-4 bg-foreground/15"
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <HeaderAuthButtons onAuth={() => setShowAuthGate(true)} />
          {/* Favourites */}
          <button
            onClick={() => {
              const signedUp = localStorage.getItem("cc_signedup") === "true";
              if (signedUp) setFavOpen(true);
              else setShowAuthGate(true);
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:inline flex items-center gap-1"
          >
            ♡ Favourites
          </button>
        </div>
      </header>

      {/* Background orb */}
      <motion.div
        animate={{
          scale: step === "intro" ? 1 : step === "results" ? 0.45 : 0.7,
          x: step === "intro" ? 0 : step === "results" ? "30%" : "0%",
          y: step === "intro" ? 0 : step === "results" ? "-10%" : "-15%",
          opacity: step === "results" ? 0.5 : 1,
        }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className={`${step === "intro" ? "absolute top-[20%]" : "fixed top-1/2"} left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] max-w-[90vw] max-h-[90vw] pointer-events-none z-0`}
      >
        <Orb intensity={orbIntensity} hue={orbHue} className="w-full h-full" />
      </motion.div>

      {/* Content */}
      <main className={`relative z-10 ${step === "intro" ? "pt-32 pb-24" : "pt-32 pb-24 min-h-screen flex items-center"} px-6 md:px-10`}>
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
              >
                <Landing onBegin={beginJourney} onFavourites={() => setShowAuthGate(true)} />
              </motion.div>
            )}

            {step === "feeling" && (
              <div key="feeling">
                <FeelingStep value={feeling} onSelect={handleFeeling} />
              </div>
            )}

            {step === "transition1" && (
              <div key="trans1" className="max-w-3xl mx-auto">
                <Transition message={TRANSITIONS.transition1} />
              </div>
            )}

            {step === "environment" && (
              <div key="environment">
                <EnvironmentStep value={environment} onSelect={handleEnvironment} />
              </div>
            )}

            {step === "direction" && (
              <div key="direction">
                <DirectionStep value={direction} onSelect={handleDirection} />
              </div>
            )}

            {step === "location" && (
              <div key="location">
                <LocationStep
                  value={states}
                  onChange={setStates}
                  onContinue={handleLocationContinue}
                />
              </div>
            )}

            {(step === "loading" || step === "results") && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-6xl mx-auto w-full"
              >
                <div className="mb-12 max-w-2xl">
                  <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                    Your guided shortlist
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-light leading-tight tracking-tight">
                    Here's what feels{" "}
                    <span className="italic text-aurora">aligned</span> with you.
                  </h1>
                  <p className="mt-4 text-muted-foreground">
                    A small, considered list — grouped by how it fits the life you described.
                  </p>
                </div>

                <Results
                  feeling={feeling}
                  direction={direction}
                  states={states}
                  loading={step === "loading"}
                  onRefine={refine}
                  onRestart={restart}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {step !== "intro" && step !== "results" && step !== "loading" && (
        <div className="fixed bottom-6 inset-x-0 text-center z-20 pointer-events-none">
          <p className="text-xs text-muted-foreground/60 italic">
            ✦ You can change anything later. There is no single right path.
          </p>
        </div>
      )}
    </div>
  );
}

/* ----------------- Rich Landing ----------------- */

function Landing({ onBegin, onFavourites }: { onBegin: () => void; onFavourites: () => void }) {
  return (
    <div className="space-y-32 md:space-y-40">
      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6"
        >
          A guided journey, not a search
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.45, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl font-light leading-[1.02] tracking-tight"
        >
          Find your dream <span className="italic text-aurora">college life</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Start with a feeling. We'll help you figure out the rest — no filters, no spreadsheets, no pressure.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.9 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <button
            onClick={onBegin}
            className="rounded-full px-10 py-4 font-medium text-primary-foreground relative overflow-hidden group inline-flex items-center gap-2"
            style={{ background: "var(--gradient-aurora)" }}
          >
            <span className="relative z-10">Begin the journey</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-xs text-muted-foreground/70 italic">
            Takes about 90 seconds. No pressure.
          </p>
        </motion.div>

        {/* trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1.2 }}
          className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center"
        >
          {[
            { n: "1,200+", l: "Colleges mapped" },
            { n: "6", l: "Steps to clarity" },
            { n: "0", l: "Spam emails" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl md:text-3xl text-aurora">{s.n}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* The 6-step journey */}
      <section className="max-w-6xl mx-auto px-2">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">How it works</div>
          <h2 className="font-display text-3xl md:text-5xl font-light leading-tight">
            Six gentle steps. <span className="italic text-aurora">No data anxiety.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-6 gap-4">
          {[
            { i: Heart, t: "Feeling", d: "What kind of life do you want?" },
            { i: Globe, t: "Environment", d: "City, mountains, beaches — what fits you?" },
            { i: Compass, t: "Direction", d: "What kind of future excites you?" },
            { i: MapPin, t: "Location", d: "Where do you want to wake up?" },
            { i: Sparkles, t: "Explore", d: "We curate, you breathe." },
            { i: GraduationCap, t: "Shortlist", d: "Keep the paths that feel right." },
          ].map((s, i) => {
            const Icon = s.i;
            return (
              <motion.div
                key={s.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.06, duration: 0.6 }}
                className="glass rounded-2xl p-5 relative"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Step {i + 1}
                </div>
                <Icon className="w-5 h-5 mb-3 text-primary" />
                <div className="font-display text-lg mb-1">{s.t}</div>
                <div className="text-xs text-muted-foreground">{s.d}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Three feelings preview */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">A taste of the journey</div>
          <h2 className="font-display text-3xl md:text-5xl font-light leading-tight">
            What does your <span className="italic text-aurora">ideal college life</span> feel like?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { k: "Fast, ambitious, career-focused", d: "Placements, networks, momentum.", hue: 200 },
            { k: "Calm, focused, distraction-free", d: "Trees, focus, real friendships.", hue: 145 },
            { k: "Creative & expressive", d: "Studios, makers, late-night ideas.", hue: 330 },
          ].map((c, i) => (
            <motion.div
              key={c.k}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              className="glass rounded-3xl p-7 relative overflow-hidden group cursor-pointer"
              onClick={onBegin}
            >
              <div
                className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 group-hover:opacity-40 blur-3xl transition-opacity duration-700"
                style={{ background: `oklch(0.78 0.18 ${c.hue})` }}
              />
              <div className="relative">
                <div className="font-display text-2xl mb-3 leading-snug">{c.k}</div>
                <p className="text-sm text-muted-foreground">{c.d}</p>
                <div className="mt-6 text-xs text-primary uppercase tracking-[0.2em] inline-flex items-center gap-1">
                  Begin here <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why X'Orb */}
      <section className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Why X'Orb</div>
            <h2 className="font-display text-3xl md:text-4xl font-light leading-tight mb-6">
              The internet sells colleges. <span className="italic text-aurora">We help you choose one.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Most platforms throw 10,000 results at you and call it choice. We start with one question — how you want to feel — and build outward from there. Less data. More direction.
            </p>
          </motion.div>
          <div className="space-y-4">
            {[
              { i: ShieldCheck, t: "Sign up to save", d: "Keep your shortlist safe. Access from any device, anytime." },
              { i: Users, t: "Built for real students", d: "Cards, not spreadsheets. Stories, not stats." },
              { i: Sparkles, t: "Calm by design", d: "Soft motion, generous space, zero pressure." },
            ].map((b, i) => {
              const Icon = b.i;
              return (
                <motion.div
                  key={b.t}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="glass rounded-2xl p-5 flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-aurora)" }}>
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display text-lg mb-1">{b.t}</div>
                    <div className="text-sm text-muted-foreground">{b.d}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Voices */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Voices</div>
          <h2 className="font-display text-3xl md:text-5xl font-light leading-tight">
            Built for the <span className="italic text-aurora">in-between moments</span>.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { q: "I had no idea where to start. This made it feel okay to not know.", a: "Aanya · Class XII" },
            { q: "Felt like a conversation with a friend, not a portal.", a: "Rohit · Dropped a year" },
            { q: "Finally something that doesn't ask for my marks first.", a: "Meera · Arts aspirant" },
          ].map((v, i) => (
            <motion.blockquote
              key={v.a}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass rounded-3xl p-7"
            >
              <div className="font-display text-xl leading-snug mb-4">"{v.q}"</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{v.a}</div>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Honest answers</div>
          <h2 className="font-display text-3xl md:text-4xl font-light leading-tight">Things students ask us</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "Do I need my marks to begin?", a: "No. We start with how you want to live, not a number." },
            { q: "How long does this take?", a: "About 90 seconds for a first pass. You can refine later." },
            { q: "Will you spam me?", a: "No. You only sign up when you want to save your favourites." },
            { q: "What if I'm completely unsure?", a: "Pick \"still figuring it out\" — that's a real, valid answer." },
            { q: "Can I change my answers later?", a: "Yes — absolutely. Everything is adjustable at any step." },
          ].map((f, i) => (
            <motion.details
              key={f.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 group"
            >
              <summary className="cursor-pointer font-medium flex items-center justify-between">
                {f.q}
                <span className="text-primary group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto text-center pb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-6xl font-light leading-tight mb-6"
        >
          You'll leave with <span className="italic text-aurora">clarity</span>.
        </motion.h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Not a list of 10,000 colleges. A small, considered shortlist that respects who you are.
        </p>
        <button
          onClick={onBegin}
          className="rounded-full px-10 py-4 font-medium text-primary-foreground inline-flex items-center gap-2"
          style={{ background: "var(--gradient-aurora)" }}
        >
          Start your journey <ArrowRight className="w-4 h-4" />
        </button>
        <p className="mt-12 text-xs text-muted-foreground/60 italic">
          ✦ You have multiple paths. Take your time.
        </p>
      </section>
    </div>
  );
}




