import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

const FAQS = [
  { q: "How is my eligibility score calculated?", a: "We weigh credit history (35%), income-to-loan ratio (25%), employment, education, dependents, property area and marital status. The total is normalized out of 100." },
  { q: 'What does "Conditional Approval" mean?', a: "Your profile passes most checks (score 50–69) but a co-applicant, reduced amount or longer tenure may be required to formalize the offer." },
  { q: "Is my data stored anywhere?", a: "Loan applications are saved to your connected Supabase table. The app does not keep application records in browser storage." },
  { q: "How can I improve my credit score?", a: "Pay every EMI/credit card bill on time, keep utilization under 30%, avoid taking multiple loans in a short window, and never default." },
  { q: "What documents will I need for a real loan?", a: "Typically: CNIC, salary slips (3 months), 6-month bank statement, employment letter and address proof. Business owners add tax returns." },
  { q: "How accurate is this AI prediction?", a: "It's an indicative pre-screen using transparent rules — banks make final decisions via their underwriting." },
  { q: "Can I apply multiple times?", a: "Yes — every submission is saved to Supabase so you can review and compare scenarios." },
  { q: "What is the minimum income required?", a: "There's no hard floor, but combined household income should give an income-to-loan ratio of ≥1.0 for a healthy score." },
];

export function Faq() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(
    () => FAQS.filter((f) => (f.q + f.a).toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <section id="faq" className="relative py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Frequently <span className="text-gradient-cyan">Asked</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Real answers, no fine print.</p>
        </div>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="w-full rounded-xl border border-border bg-input/60 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`glass rounded-2xl overflow-hidden transition-all ${isOpen ? "border-primary/60 glow-cyan" : ""}`}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className={`font-medium ${isOpen ? "text-primary" : "text-foreground"}`}>{f.q}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}>
                      <p className="px-5 pb-4 text-sm text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-6">No matching questions.</p>}
        </div>
      </div>
    </section>
  );
}
