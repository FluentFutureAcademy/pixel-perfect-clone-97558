import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, X } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { calcEMI, fmtPKR, setPrefill } from "@/lib/history";
import { calculateScore, defaultFormData } from "@/lib/scoring";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare Loans — VaultIQ" }, { name: "description", content: "Side-by-side comparison of up to 3 loan scenarios with VaultIQ." }] }),
  component: ComparePage,
});

type Scenario = { amount: number; tenure: number; income: number };

function defaultScenario(seed: number): Scenario {
  return { amount: 500000 + seed * 250000, tenure: 24 + seed * 12, income: 80000 };
}

function ComparePage() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([defaultScenario(0), defaultScenario(1)]);

  const computed = useMemo(() => scenarios.map((s) => {
    const r = calculateScore({ ...defaultFormData, loanAmount: s.amount, loanTerm: s.tenure as any, income: s.income });
    const rate = r.score >= 70 ? 12 : 16;
    const emi = calcEMI(s.amount, rate, s.tenure);
    const total = emi * s.tenure;
    const interest = total - s.amount;
    return { rate, emi, total, interest, score: r.score, decision: r.decision };
  }), [scenarios]);

  const bestIdx = useMemo(() => {
    const eligible = computed.map((c, i) => ({ c, i })).filter((x) => x.c.score >= 70);
    if (eligible.length === 0) return -1;
    return eligible.sort((a, b) => a.c.total - b.c.total)[0].i;
  }, [computed]);

  const update = (i: number, patch: Partial<Scenario>) => {
    setScenarios((s) => s.map((sc, idx) => idx === i ? { ...sc, ...patch } : sc));
  };

  const remove = (i: number) => setScenarios((s) => s.filter((_, idx) => idx !== i));
  const add = () => scenarios.length < 3 && setScenarios((s) => [...s, defaultScenario(s.length)]);

  const applyBest = () => {
    if (bestIdx < 0) return;
    const s = scenarios[bestIdx];
    setPrefill({ loanAmount: s.amount, loanTerm: s.tenure as any, income: s.income });
    navigate({ to: "/", hash: "apply" });
  };

  return (
    <SiteLayout>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Loan <span className="text-gradient-cyan">Comparison</span></h1>
              <p className="mt-2 text-muted-foreground">Compare up to 3 scenarios side by side.</p>
            </div>
            <div className="flex gap-2">
              {scenarios.length < 3 && (
                <button onClick={add} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-accent">
                  <Plus className="h-4 w-4" /> Add scenario
                </button>
              )}
              {bestIdx >= 0 && (
                <button onClick={applyBest}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-cyan px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan">
                  Apply for Best Option
                </button>
              )}
            </div>
          </div>

          <div className={`grid gap-5 ${scenarios.length===1?"md:grid-cols-1":scenarios.length===2?"md:grid-cols-2":"md:grid-cols-3"}`}>
            {scenarios.map((s, i) => {
              const c = computed[i];
              const isBest = i === bestIdx;
              return (
                <motion.div key={i} layout
                  className={`glass rounded-3xl p-6 relative ${isBest ? "border-primary glow-cyan" : ""}`}>
                  {isBest && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-cyan px-3 py-1 text-xs font-semibold text-primary-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> Best Option
                    </div>
                  )}
                  {scenarios.length > 1 && (
                    <button onClick={() => remove(i)} className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full hover:bg-accent text-muted-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <h3 className="font-semibold mb-4">Scenario {i + 1}</h3>
                  <div className="space-y-3">
                    <Input label="Loan Amount" value={s.amount} onChange={(v) => update(i, { amount: v })} />
                    <Input label="Tenure (months)" value={s.tenure} onChange={(v) => update(i, { tenure: v })} />
                    <Input label="Monthly Income" value={s.income} onChange={(v) => update(i, { income: v })} />
                    <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Interest Rate (auto): <span className="font-semibold text-foreground">{c.rate}%</span>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    <Row label="Monthly EMI" value={fmtPKR(c.emi)} />
                    <Row label="Total Interest" value={fmtPKR(c.interest)} />
                    <Row label="Total Payment" value={fmtPKR(c.total)} highlight />
                    <Row label="Eligibility Score" value={`${c.score}/100`} />
                    <Row label="Decision" value={c.decision} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Input({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-1 rounded-lg border border-border bg-input/60 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <motion.div key={value} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
      className={`flex justify-between rounded-lg px-3 py-2 text-sm ${highlight ? "bg-primary/10 text-primary font-semibold" : "bg-muted/40"}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </motion.div>
  );
}
