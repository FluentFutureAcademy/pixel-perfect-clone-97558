import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { loadHistory, fmtPKR, type HistoryRecord } from "@/lib/history";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "VaultIQ Analytics" }, { name: "description", content: "Visualize your loan application history with VaultIQ charts and insights." }] }),
  component: DashboardPage,
});

const DECISION_COLORS = {
  APPROVED: "oklch(0.78 0.18 155)",
  CONDITIONAL: "oklch(0.85 0.16 85)",
  REJECTED: "oklch(0.65 0.24 25)",
} as const;

function DashboardPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory()
      .then(setHistory)
      .catch((error) => {
        console.error("Failed to load Supabase analytics", error);
        toast.error("Could not load analytics from Supabase.");
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = history.length;
    const approved = history.filter((h) => h.result.decision === "APPROVED").length;
    const conditional = history.filter((h) => h.result.decision === "CONDITIONAL").length;
    const rejected = history.filter((h) => h.result.decision === "REJECTED").length;
    const avgScore = total ? Math.round(history.reduce((s, h) => s + h.result.score, 0) / total) : 0;
    const totalApplied = history.reduce((s, h) => s + h.data.loanAmount, 0);
    const approvalRate = total ? Math.round((approved / total) * 100) : 0;

    const purposeCount: Record<string, number> = {};
    history.forEach((h) => { purposeCount[h.data.purpose] = (purposeCount[h.data.purpose] || 0) + 1; });
    const commonPurpose = Object.entries(purposeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const rejectedList = history.filter((h) => h.result.decision === "REJECTED");
    const reasonCount: Record<string, number> = {};
    rejectedList.forEach((h) => {
      const weakest = [...h.result.breakdown].sort((a, b) => a.points - b.points)[0];
      if (weakest) reasonCount[weakest.label] = (reasonCount[weakest.label] || 0) + 1;
    });
    const commonReason = Object.entries(reasonCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    const pie = [
      { name: "Approved", value: approved, color: DECISION_COLORS.APPROVED },
      { name: "Conditional", value: conditional, color: DECISION_COLORS.CONDITIONAL },
      { name: "Rejected", value: rejected, color: DECISION_COLORS.REJECTED },
    ].filter((s) => s.value > 0);

    const bars = [...history].reverse().map((h, i) => ({
      name: h.data.fullName?.slice(0, 8) || `App ${i + 1}`,
      score: h.result.score,
      fill: DECISION_COLORS[h.result.decision],
    }));

    return { total, avgScore, totalApplied, approvalRate, commonPurpose, commonReason, pie, bars };
  }, [history]);

  if (loading) {
    return (
      <SiteLayout>
        <section className="px-6 py-20 text-center">
          <div className="mx-auto max-w-md glass rounded-3xl p-10">
            <h1 className="text-3xl font-bold">Loading VaultIQ Analytics</h1>
            <p className="mt-3 text-muted-foreground">Fetching applications from Supabase…</p>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (history.length === 0) {
    return (
      <SiteLayout>
        <section className="px-6 py-20 text-center">
          <div className="mx-auto max-w-md glass rounded-3xl p-10">
            <h1 className="text-3xl font-bold">No applications found in VaultIQ vault.</h1>
            <p className="mt-3 text-muted-foreground">Submit at least one application to unlock VaultIQ Analytics.</p>
            <Link to="/" hash="apply"
              className="mt-6 inline-flex rounded-xl bg-gradient-cyan px-6 py-3 text-sm font-semibold text-primary-foreground glow-cyan">
              Start an application
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">VaultIQ <span className="text-gradient-cyan">Analytics</span></h1>
            <p className="mt-2 text-muted-foreground">Insights across {stats.total} application{stats.total !== 1 ? "s" : ""}.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Metric label="Total Applications" value={String(stats.total)} />
            <Metric label="Average Score" value={String(stats.avgScore)} suffix="/100" />
            <Metric label="Total Amount Applied" value={fmtPKR(stats.totalApplied)} />
            <Metric label="Approval Rate" value={`${stats.approvalRate}%`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Decision Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} animationDuration={1200}>
                      {stats.pie.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Scores Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.bars}>
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <InfoCard title="Most Common Rejection Reason" value={stats.commonReason} accent="oklch(0.65 0.24 25)" />
            <InfoCard title="Most Common Loan Purpose" value={stats.commonPurpose} accent="oklch(0.82 0.17 200)" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gradient-cyan">
        {value}{suffix && <span className="text-sm text-muted-foreground font-normal">{suffix}</span>}
      </p>
    </motion.div>
  );
}

function InfoCard({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="glass rounded-3xl p-6">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-3 text-2xl font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}
