import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Shield, Zap, Brain, CheckCircle2, ArrowDown, ArrowRight } from "lucide-react";

function ScoreRing() {
  const progress = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const offset = useTransform(progress, (v) => 565.48 - (565.48 * v) / 100);

  useEffect(() => {
    const controls = animate(progress, 92, {
      duration: 2.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [progress]);

  return (
    <div className="relative grid place-items-center">
      <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
        <circle cx="110" cy="110" r="90" stroke="var(--border)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="110" cy="110" r="90" fill="none"
          stroke="url(#cyanGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray="565.48"
          style={{ strokeDashoffset: offset, filter: "drop-shadow(0 0 12px var(--primary))" }}
        />
        <defs>
          <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.17 200)" />
            <stop offset="100%" stopColor="oklch(0.9 0.14 190)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-5xl font-bold tabular-nums text-gradient-cyan">{display}%</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Eligibility</div>
        </div>
      </div>
    </div>
  );
}

function Particles() {
  const items = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = 2 + Math.random() * 4;
        const delay = Math.random() * 6;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-primary/60 animate-float-particle"
            style={{
              left: `${left}%`, top: `${top}%`,
              width: size, height: size,
              animationDelay: `${delay}s`,
              filter: "blur(0.5px)",
              boxShadow: "0 0 8px var(--primary)",
            }}
          />
        );
      })}
    </div>
  );
}

export function Hero({ onApply }: { onApply: () => void }) {
  return (
    <section id="top" className="relative min-h-screen pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-hero-radial" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <Particles />

      <div className="relative mx-auto max-w-6xl px-6 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            🏦 Trusted AI Loan Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Unlock Smarter Loan Decisions with
            <br />
            <span className="text-gradient-cyan">VaultIQ</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            AI-powered loan prediction that analyzes your financial profile and delivers
            instant, intelligent approval insights — free, fast & secure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              onClick={onApply}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-cyan px-6 py-3.5 font-semibold text-primary-foreground glow-cyan hover:glow-cyan-strong transition-all"
            >
              Check Eligibility Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 px-6 py-3.5 font-semibold text-foreground hover:bg-primary/10 transition-colors"
            >
              How It Works
            </a>
          </motion.div>

          <div id="trust" className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
            {[
              { icon: Shield, label: "Vault-Grade Security" },
              { icon: Zap, label: "Instant Results" },
              { icon: Brain, label: "IQ-Powered Analysis" },
              { icon: CheckCircle2, label: "98% Accuracy" },
            ].map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="glass rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs"
              >
                <b.icon className="h-4 w-4 text-primary" />
                <span className="text-foreground/90">{b.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="relative grid place-items-center"
        >
          <div className="absolute inset-10 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative glass rounded-3xl p-10 glow-cyan">
            <ScoreRing />
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Sample applicant · Live model preview
            </div>
          </div>
        </motion.div>
      </div>

      <a href="#apply" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce">
        <ArrowDown className="h-5 w-5" />
      </a>
    </section>
  );
}
