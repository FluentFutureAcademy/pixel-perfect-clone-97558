import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Slider } from "@/components/form-bits";
import { calcEMI, fmtPKR } from "@/lib/history";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/emi")({
  head: () => ({ meta: [{ title: "EMI Calculator — VaultIQ" }, { name: "description", content: "Calculate your monthly EMI, total interest and payment schedule with VaultIQ." }] }),
  component: EmiPage,
});

function EmiPage() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(14);
  const [tenure, setTenure] = useState(24);

  const { emi, total, interest, pie } = useMemo(() => {
    const emi = calcEMI(amount, rate, tenure);
    const total = emi * tenure;
    const interest = total - amount;
    return {
      emi, total, interest,
      pie: [
        { name: "Principal", value: amount, color: "oklch(0.82 0.17 200)" },
        { name: "Interest", value: interest, color: "oklch(0.85 0.16 85)" },
      ],
    };
  }, [amount, rate, tenure]);

  return (
    <SiteLayout>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">EMI <span className="text-gradient-cyan">Calculator</span></h1>
            <p className="mt-2 text-muted-foreground">Plan your monthly installments in seconds.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 space-y-6">
              <Field label={`Loan Amount — ${fmtPKR(amount)}`}>
                <Slider value={amount} onChange={setAmount} min={10000} max={5000000} step={10000} />
              </Field>
              <Field label={`Interest Rate — ${rate}% p.a.`}>
                <Slider value={rate} onChange={setRate} min={6} max={30} step={0.5} />
              </Field>
              <Field label={`Tenure — ${tenure} months`}>
                <Slider value={tenure} onChange={setTenure} min={6} max={120} step={6} />
              </Field>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <Stat label="EMI" value={fmtPKR(emi)} />
                <Stat label="Interest" value={fmtPKR(interest)} />
                <Stat label="Total" value={fmtPKR(total)} />
              </div>
            </div>
            <div className="glass rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Principal vs Interest</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} animationDuration={1000}>
                      {pie.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtPKR(Number(v))} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-sm">
                {pie.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: s.color }} /> {s.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="block text-sm font-medium">{label}</label>{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-primary tabular-nums">{value}</p>
    </div>
  );
}
