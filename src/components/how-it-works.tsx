import { ClipboardList, Cpu, Sparkles } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Tell us about you", desc: "Share income, credit and loan details in a 4-step wizard." },
  { icon: Cpu, title: "AI scores your profile", desc: "Our rule-based engine weighs 7 key signals to produce a 0–100 score." },
  { icon: Sparkles, title: "Get an instant decision", desc: "Approved, conditional, or reviewed — with a full breakdown." },
];

export function HowItWorks() {
  return (
    <section id="how" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How <span className="text-gradient-cyan">it works</span>
          </h2>
          <p className="mt-3 text-muted-foreground">A transparent, explainable model — not a black box.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="glass rounded-2xl p-6 hover:glow-cyan transition-all">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-cyan glow-cyan">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </span>
                <span className="text-3xl font-bold text-muted-foreground/30 tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
