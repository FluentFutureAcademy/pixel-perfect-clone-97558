import { useMemo } from "react";
import type { FormData, ScoreResult } from "@/lib/scoring";
import { calcEMI, fmtPKR } from "@/lib/history";

export function FinancialHealth({ data, result }: { data: FormData; result: ScoreResult }) {
  const { score, badge, color, breakdown, advice } = useMemo(() => {
    const totalIncome = data.income + data.coIncome;
    const newEmi = calcEMI(data.loanAmount, result.decision === "APPROVED" ? 12 : 16, data.loanTerm);
    const dti = totalIncome > 0 ? (data.emi + newEmi) / totalIncome : 1;
    const dtiPts = Math.max(0, Math.round(30 * (1 - Math.min(dti, 1))));
    const savings = totalIncome - data.emi - newEmi;
    const savingsPts = Math.max(0, Math.min(25, Math.round((savings / Math.max(totalIncome,1)) * 50)));
    const empPts = data.employment === "Salaried" ? 25 : 15;
    const depPts = { "0": 20, "1": 15, "2": 10, "3+": 5 }[data.dependents];
    const total = dtiPts + savingsPts + empPts + depPts;
    const badge = total >= 81 ? "Excellent" : total >= 61 ? "Good" : total >= 41 ? "Fair" : "Poor";
    const color = total >= 81 ? "oklch(0.78 0.18 155)" : total >= 61 ? "oklch(0.82 0.17 200)" : total >= 41 ? "oklch(0.85 0.16 85)" : "oklch(0.65 0.24 25)";
    const breakdown = [
      { label: "Debt-to-Income", points: dtiPts, max: 30 },
      { label: "Savings Potential", points: savingsPts, max: 25 },
      { label: "Employment Stability", points: empPts, max: 25 },
      { label: "Dependents Burden", points: depPts, max: 20 },
    ];
    const weakest = [...breakdown].sort((a, b) => a.points / a.max - b.points / b.max)[0];
    const tips: Record<string, string[]> = {
      "Debt-to-Income": [
        `Your monthly obligations consume too much of your income.`,
        `Aim to keep total EMIs under 40% of household income.`,
        `Consider a longer tenure or smaller principal to free up cashflow.`,
      ],
      "Savings Potential": [
        `Little is left after EMIs — your savings buffer is thin.`,
        `Trim discretionary spending and automate a fixed monthly save.`,
        `Even ${fmtPKR(5000)} per month builds a meaningful emergency fund.`,
      ],
      "Employment Stability": [
        `Self-employed income is harder to verify for lenders.`,
        `Maintain audited tax returns and steady bank inflows for 12+ months.`,
        `A salaried co-applicant can significantly improve your file.`,
      ],
      "Dependents Burden": [
        `A larger family raises monthly outflows lenders factor in.`,
        `Document any working co-applicants in the household.`,
        `Build a higher emergency buffer to offset the obligation.`,
      ],
    };
    return { score: total, badge, color, breakdown, advice: tips[weakest.label] };
  }, [data, result.decision]);

  const segments = [
    { range: "0–40", color: "oklch(0.65 0.24 25)" },
    { range: "41–60", color: "oklch(0.85 0.16 85)" },
    { range: "61–80", color: "oklch(0.82 0.17 200)" },
    { range: "81–100", color: "oklch(0.78 0.18 155)" },
  ];

  return (
    <div className="mt-6 glass rounded-3xl p-6 md:p-8 text-left">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold">Your Financial Health Score</h3>
          <p className="text-xs text-muted-foreground">Independent of loan eligibility — measures overall money health.</p>
        </div>
        <div className="rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: `${color}25`, color }}>
          {badge} · {score}/100
        </div>
      </div>

      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div key={s.range} className="flex-1" style={{ background: `${s.color}30` }} />
        ))}
      </div>
      <div className="relative mt-1 h-4">
        <div className="absolute top-0 -translate-x-1/2 transition-all duration-700"
             style={{ left: `${score}%` }}>
          <div className="h-3 w-3 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {breakdown.map((b) => (
          <div key={b.label} className="flex justify-between rounded-lg bg-muted/40 px-4 py-2.5 text-sm">
            <span className="text-foreground/90">{b.label}</span>
            <span className="font-semibold tabular-nums" style={{ color }}>{b.points}/{b.max}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Personalized advice</p>
        <ul className="space-y-1 text-sm text-foreground/90">
          {advice.map((a, i) => <li key={i}>• {a}</li>)}
        </ul>
      </div>
    </div>
  );
}
