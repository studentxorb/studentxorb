import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orb } from "@/components/Orb";
import { FEELINGS, DIRECTIONS, ENVIRONMENTS } from "@/lib/colleges";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome · Student X'Orb" },
      { name: "description", content: "A quick three-question welcome to start your college discovery journey." },
    ],
  }),
  component: Onboarding,
});

type Step = 0 | 1 | 2 | 3;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [direction, setDirection] = useState<string | null>(null);
  const [env, setEnv] = useState<string | null>(null);

  const orbHue = FEELINGS.find((f) => f.id === feeling)?.hue ?? 0.55;
  const intensity = 0.3 + step * 0.18;

  function startJourney() {
    const params = new URLSearchParams();
    if (feeling) params.set("f", feeling);
    if (direction) params.set("d", direction);
    if (env) {
      const e = ENVIRONMENTS.find((x) => x.id === env);
      if (e?.states?.length) params.set("s", e.states.join("|"));
    }
    const qs = params.toString();
    navigate({ to: "/", search: () => Object.fromEntries(params) as any, replace: true });
    if (typeof window !== "undefined") {
      window.location.href = qs ? `/?${qs}` : "/";
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
        <Orb hue={orbHue} intensity={intensity} />
      </div>

      <div className="container mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Welcome
          </span>
          <span>Step {Math.min(step + 1, 4)} / 4</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <Pane key="0">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Hi. Let&apos;s find a college that fits the life you actually want.
              </h1>
              <p className="mt-4 text-muted-foreground">
                Three quick questions, then your guided journey begins.
              </p>
              <Cta onClick={() => setStep(1)}>Begin</Cta>
            </Pane>
          )}

          {step === 1 && (
            <Pane key="1">
              <Label>What matters most to you?</Label>
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FEELINGS.slice(0, 8).map((f) => (
                  <Choice
                    key={f.id}
                    active={feeling === f.id}
                    onClick={() => {
                      setFeeling(f.id);
                      setTimeout(() => setStep(2), 200);
                    }}
                  >
                    {f.label}
                  </Choice>
                ))}
              </div>
            </Pane>
          )}

          {step === 2 && (
            <Pane key="2">
              <Label>Which direction pulls you?</Label>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DIRECTIONS.map((d) => (
                  <Choice
                    key={d}
                    active={direction === d}
                    onClick={() => {
                      setDirection(d);
                      setTimeout(() => setStep(3), 200);
                    }}
                  >
                    {d}
                  </Choice>
                ))}
              </div>
            </Pane>
          )}

          {step === 3 && (
            <Pane key="3">
              <Label>What kind of place feels like home?</Label>
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ENVIRONMENTS.slice(0, 6).map((e) => (
                  <Choice
                    key={e.id}
                    active={env === e.id}
                    onClick={() => setEnv(e.id)}
                  >
                    {e.label}
                  </Choice>
                ))}
              </div>
              <Cta onClick={startJourney}>Start my journey</Cta>
            </Pane>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{children}</h2>;
}

function Choice({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card/40 text-muted-foreground hover:border-primary/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Cta({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
    >
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  );
}
