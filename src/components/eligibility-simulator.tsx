import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { calculateScore, defaultFormData } from "@/lib/scoring";
import { fmtPKR, setPrefill } from "@/lib/history";
import { Slider } from "./form-bits";
import { useNavigate } from "@tanstack/react-router";

function MiniGauge({ score }: { score: number }) {
  const progress = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const offset = useTransform(progress, (v) => 502 - (502 * v) / 100);
  const color = score >= 70 ? "oklch(0.78 0.18 155)" : score >= 50 ? "oklch(0.85 0.16 85)" : "oklch(0.65 0.24 25)";
  useEffect(() => {
    const c = animate(progress, score, { duration: 0.6, onUpdate: (v) => setDisplay(Math.round(v)) });
    return c.stop;
  }, [progress, score]);
  return (
    <div className="relative grid place-items-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r="80" stroke="var(--border)" strokeWidth="12" fill="none" />
        <motion.circle cx="100" cy="100" r="80" stroke={color} strokeWidth="12" fill="none" strokeLinecap="round"
          strokeDasharray="502" style={{ strokeDashoffset: offset, filter: `drop-shadow(0 0 12px ${color})` }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-5xl font-bold tabular-nums" style={{ color }}>{display}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">/100</div>
        </div>
      </div>
    </div>
  );
}

export function EligibilitySimulator() {
  const navigate = useNavigate();
  const [income, setIncome] = useState(80000);
  const [loanAmount, setLoanAmount] = useState(500000);
  const [term, setTerm] = useState<6 | 12 | 24 | 36 | 48 | 60>(24);
  const [credit, setCredit] = useState<0 | 1>(1);
  const [emp, setEmp] = useState<"Salaried" | "Self-Employed">("Salaried");

  const result = calculateScore({
    ...defaultFormData,
    income, loanAmount, loanTerm: term, creditHistory: credit, employment: emp,
  });

  const recommendation = (() => {
    if (result.score >= 70) return "Excellent! You're on track for approval.";
    if (result.score >= 50) return `Boost income by ${fmtPKR(15000)} or extend tenure to reach Approved.`;
    if (credit === 0) return "Build credit history (good repayments) to gain +35 points.";
    return `Lower loan amount or increase income to improve your score.`;
  })();

  const apply = () => {
    setPrefill({ income, loanAmount, loanTerm: term, creditHistory: credit, employment: emp });
    navigate({ to: "/", hash: "apply" });
    setTimeout(() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <section id="simulate" className="relative py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Simulate Your <span className="text-gradient-cyan">Eligibility</span>
          </h2>
          <p className="mt-3 text-muted-foreground">No form. Move the sliders, watch your score update live.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <SliderRow label={`Monthly Income — ${fmtPKR(income)}`}>
              <Slider value={income} onChange={setIncome} min={0} max={300000} step={1000} />
            </SliderRow>
            <SliderRow label={`Loan Amount — ${fmtPKR(loanAmount)}`}>
              <Slider value={loanAmount} onChange={setLoanAmount} min={10000} max={5000000} step={10000} />
            </SliderRow>
            <SliderRow label={`Loan Term — ${term} months`}>
              <Slider value={term} onChange={(v) => setTerm(([6,12,24,36,48,60].reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a)) as any)} min={6} max={60} step={6} />
            </SliderRow>
            <div className="grid grid-cols-2 gap-3">
              <Toggle2 label="Credit History" options={["Good","Poor"]} value={credit===1?"Good":"Poor"} onChange={(v)=>setCredit(v==="Good"?1:0)} />
              <Toggle2 label="Employment" options={["Salaried","Self-Employed"]} value={emp} onChange={(v)=>setEmp(v as any)} />
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
            <MiniGauge score={result.score} />
            <div className="mt-4 rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{ background: `${result.score>=70?"oklch(0.78 0.18 155)":result.score>=50?"oklch(0.85 0.16 85)":"oklch(0.65 0.24 25)"}25`,
                       color: result.score>=70?"oklch(0.78 0.18 155)":result.score>=50?"oklch(0.85 0.16 85)":"oklch(0.65 0.24 25)" }}>
              {result.decision}
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">{recommendation}</p>
            <button onClick={apply}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-cyan px-6 py-3 text-sm font-semibold text-primary-foreground glow-cyan hover:glow-cyan-strong transition-all">
              Apply Now With These Values
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Toggle2({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="grid auto-cols-fr grid-flow-col gap-2 rounded-xl border border-border bg-muted/40 p-1">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              value===o ? "bg-gradient-cyan text-primary-foreground glow-cyan" : "text-muted-foreground hover:text-foreground"
            }`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
