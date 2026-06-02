import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { loadHistory, deleteHistory, fmtPKR, type HistoryRecord } from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "VaultIQ Application History" }, { name: "description", content: "All your past loan applications and decisions in your VaultIQ vault." }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory()
      .then(setHistory)
      .catch((error) => {
        console.error("Failed to load Supabase history", error);
        toast.error("Could not load applications from Supabase.");
      })
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    try {
      await deleteHistory(id);
      setHistory((records) => records.filter((record) => record.id !== id));
      toast.success("🗑️ Record deleted from Supabase.");
    } catch (error) {
      console.error("Failed to delete Supabase record", error);
      toast.error("Could not delete this Supabase record.");
    }
  };

  const color = (d: string) =>
    d === "APPROVED" ? "oklch(0.78 0.18 155)" : d === "CONDITIONAL" ? "oklch(0.85 0.16 85)" : "oklch(0.65 0.24 25)";

  return (
    <SiteLayout>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">VaultIQ <span className="text-gradient-cyan">Application History</span></h1>
            <p className="mt-2 text-muted-foreground">{history.length} record{history.length !== 1 ? "s" : ""} loaded from Supabase.</p>
          </div>

          {loading ? (
            <div className="glass rounded-3xl p-10 text-center">
              <p className="text-muted-foreground">Loading applications from Supabase…</p>
            </div>
          ) : history.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <p className="text-muted-foreground">No applications found in VaultIQ vault.</p>
              <Link to="/" hash="apply" className="mt-4 inline-flex rounded-xl bg-gradient-cyan px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan">
                Start one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {history.map((rec) => (
                  <motion.div key={rec.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="glass rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{rec.data.fullName || "Unnamed applicant"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rec.date).toLocaleString()} · {rec.data.purpose} · {fmtPKR(rec.data.loanAmount)} · {rec.data.loanTerm} mo
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold tabular-nums" style={{ color: color(rec.result.decision) }}>{rec.result.score}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/100</div>
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: `${color(rec.result.decision)}25`, color: color(rec.result.decision) }}>
                        {rec.result.decision}
                      </span>
                      <button onClick={() => remove(rec.id)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-destructive/15 hover:border-destructive hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
