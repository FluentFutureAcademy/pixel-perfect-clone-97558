import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { calculateScore, type FormData, type ScoreResult } from "@/lib/scoring";
import { fmtPKR, setPrefill } from "@/lib/history";
import { Slider } from "./form-bits";

export function ReapplySimulator({ data, original }: { data: FormData; original: ScoreResult }) {
  const navigate = useNavigate();
  const [income, setIncome] = useState(data.income);
  const [loanAmount, setLoanAmount] = useState(data.loanAmount);
  const [term, setTerm] = useState<FormData["loanTerm"]>(data.loanTerm);

  const newResult = useMemo(
    () => calculateScore({ ...data, income, loanAmount, loanTerm: term }),
    [data, income, loanAmount, term],
  );

  const diff = newResult.score - original.score;
  const color = newResult.score >= 70 ? "oklch(0.78 0.18 155)" : newResult.score >= 50 ? "oklch(0.85 0.16 85)" : "oklch(0.65 0.24 25)";

  const apply = () => {
    setPrefill({ income, loanAmount, loanTerm: term });
    navigate({ to: "/" });
    setTimeout(() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  return (
    <div className="mt-6 glass rounded-3xl p-6 md:p-8 text-left">
      <h3 className="text-lg font-semibold">What If I Change My Details?</h3>
      <p className="text-xs text-muted-foreground">Adjust the sliders to find a winning combination.</p>

      <div className="mt-6 grid lg:grid-cols-2 gap-6 items-center">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Monthly Income — {fmtPKR(income)}</label>
            <Slider value={income} onChange={setIncome} min={0} max={300000} step={1000} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Loan Amount — {fmtPKR(loanAmount)}</label>
            <Slider value={loanAmount} onChange={setLoanAmount} min={10000} max={5000000} step={10000} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Loan Term — {term} months</label>
            <Slider value={term} onChange={(v) => setTerm(([6,12,24,36,48,60].reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a)) as FormData["loanTerm"])} min={6} max={60} step={6} />
          </div>
        </div>

        <div className="flex flex-col items-center text-center rounded-2xl border border-border bg-muted/30 p-6">
          <motion.div key={newResult.score} initial={{ scale: 0.85 }} animate={{ scale: 1 }}
            className="text-6xl font-bold tabular-nums" style={{ color }}>
            {newResult.score}
          </motion.div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">/ 100 Score</div>
          <div className="mt-3 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: `${color}25`, color }}>
            {newResult.decision}
          </div>
          {diff !== 0 && (
            <div className={`mt-2 text-sm font-semibold ${diff > 0 ? "text-success" : "text-destructive"}`}>
              {diff > 0 ? "+" : ""}{diff} pts {diff > 0 ? "↑" : "↓"} vs original
            </div>
          )}
          <button onClick={apply}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-cyan px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan hover:glow-cyan-strong transition-all">
            Apply With These Values
          </button>
        </div>
      </div>
    </div>
  );
}
