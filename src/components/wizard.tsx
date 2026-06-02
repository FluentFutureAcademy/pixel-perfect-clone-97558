import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Home, Car, GraduationCap, Briefcase, User, Heart } from "lucide-react";
import { toast } from "sonner";
import { defaultFormData, type FormData } from "@/lib/scoring";
import { consumePrefill } from "@/lib/history";
import { Field, TextInput, Toggle, Slider, PillGroup } from "./form-bits";
import { cn } from "@/lib/utils";

const steps = ["Personal", "Financial", "Loan", "Review"] as const;
const stepLabels = ["Personal Info", "Financial Info", "Loan Details", "Review"] as const;

const purposeIcons = {
  Home, Car, Education: GraduationCap, Business: Briefcase, Personal: User, Medical: Heart,
};

function fmtPKR(n: number) {
  return "₨ " + n.toLocaleString("en-PK");
}

export function Wizard({ onSubmit }: { onSubmit: (d: FormData) => Promise<void> | void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(defaultFormData);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const p = consumePrefill();
    if (p) {
      setData((d) => ({ ...d, ...p }));
      toast.success("✨ Prefilled with your selected values");
    }
  }, []);

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => setData((d) => ({ ...d, [k]: v }));

  const next = () => {
    setStep((s) => {
      const ns = Math.min(3, s + 1);
      if (ns !== s && ns < 4) toast.success(`✅ Step ${s + 1} Complete! Moving to ${stepLabels[ns]}…`);
      return ns;
    });
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch {
      // parent shows its own error toast; keep state so the user can retry
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return data.fullName.trim().length >= 2 && data.age >= 18 && data.age <= 70;
    return true;
  };

  return (
    <section id="apply" className="relative py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your <span className="text-gradient-cyan">eligibility</span> in 4 steps
          </h2>
          <p className="mt-3 text-muted-foreground">No paperwork. No waiting. Just answers.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-9 w-9 grid place-items-center rounded-full text-sm font-semibold transition-all",
                    i < step && "bg-primary text-primary-foreground",
                    i === step && "bg-gradient-cyan text-primary-foreground glow-cyan",
                    i > step && "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn("text-xs", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-cyan"
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">Step {step + 1} of 4</p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <Field label="Full Name">
                    <TextInput
                      value={data.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field label={`Age — ${data.age}`} hint="Between 18 and 70">
                    <Slider value={data.age} onChange={(v) => update("age", v)} min={18} max={70} />
                  </Field>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Gender">
                      <Toggle options={["Male", "Female", "Other"] as const} value={data.gender} onChange={(v) => update("gender", v)} />
                    </Field>
                    <Field label="Marital Status">
                      <Toggle options={["Single", "Married", "Divorced"] as const} value={data.marital} onChange={(v) => update("marital", v)} />
                    </Field>
                    <Field label="Dependents">
                      <Toggle options={["0", "1", "2", "3+"] as const} value={data.dependents} onChange={(v) => update("dependents", v)} />
                    </Field>
                    <Field label="Education">
                      <Toggle options={["Graduate", "Not Graduate"] as const} value={data.education} onChange={(v) => update("education", v)} />
                    </Field>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Employment Status">
                    <Toggle options={["Salaried", "Self-Employed"] as const} value={data.employment} onChange={(v) => update("employment", v)} />
                  </Field>
                  <Field label={`Monthly Applicant Income — ${fmtPKR(data.income)}`}>
                    <Slider value={data.income} onChange={(v) => update("income", v)} min={0} max={200000} step={1000} />
                    <TextInput type="number" value={data.income} onChange={(e) => update("income", Number(e.target.value))} className="mt-2" />
                  </Field>
                  <Field label={`Co-applicant Income (optional) — ${fmtPKR(data.coIncome)}`}>
                    <Slider value={data.coIncome} onChange={(v) => update("coIncome", v)} min={0} max={200000} step={1000} />
                  </Field>
                  <Field label="Existing EMI / Monthly Obligations (PKR)">
                    <TextInput type="number" value={data.emi} onChange={(e) => update("emi", Number(e.target.value))} />
                  </Field>
                  <Field label="Credit History" hint="Good = on-time repayment record. Poor = history of defaults.">
                    <Toggle
                      options={["Good", "Poor"] as const}
                      value={data.creditHistory === 1 ? "Good" : "Poor"}
                      onChange={(v) => update("creditHistory", v === "Good" ? 1 : 0)}
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Loan Purpose">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(["Home", "Car", "Education", "Business", "Personal", "Medical"] as const).map((p) => {
                        const Icon = purposeIcons[p];
                        const active = data.purpose === p;
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => update("purpose", p)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                              active
                                ? "border-primary bg-primary/15 text-primary glow-cyan"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                            )}
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-sm font-medium">{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label={`Loan Amount — ${fmtPKR(data.loanAmount)}`}>
                    <Slider value={data.loanAmount} onChange={(v) => update("loanAmount", v)} min={10000} max={5000000} step={10000} />
                    <TextInput type="number" value={data.loanAmount} onChange={(e) => update("loanAmount", Number(e.target.value))} className="mt-2" />
                  </Field>
                  <Field label="Loan Term (months)">
                    <PillGroup options={[6, 12, 24, 36, 48, 60] as const} value={data.loanTerm} onChange={(v) => update("loanTerm", v as FormData["loanTerm"])} />
                  </Field>
                  <Field label="Property Area">
                    <Toggle options={["Urban", "Semi-Urban", "Rural"] as const} value={data.propertyArea} onChange={(v) => update("propertyArea", v)} />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 className="text-lg font-semibold">Review your application</h3>

                  <ReviewCard title="Personal Summary" rows={[
                    ["Name", data.fullName || "—"],
                    ["Age", data.age],
                    ["Gender", data.gender],
                    ["Marital Status", data.marital],
                    ["Dependents", data.dependents],
                    ["Education", data.education],
                  ]} />

                  <ReviewCard title="Financial Summary" rows={[
                    ["Employment", data.employment],
                    ["Monthly Income", fmtPKR(data.income)],
                    ["Co-applicant Income", fmtPKR(data.coIncome)],
                    ["Existing EMI", fmtPKR(data.emi)],
                    ["Credit History", data.creditHistory === 1 ? "Good" : "Poor"],
                  ]} />

                  <ReviewCard title="Loan Summary" rows={[
                    ["Purpose", data.purpose],
                    ["Amount", fmtPKR(data.loanAmount)],
                    ["Term", `${data.loanTerm} months`],
                    ["Property Area", data.propertyArea],
                  ]} />

                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Confirmation</h4>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">I confirm all information is accurate and may be used for credit assessment.</span>
                    </label>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-cyan px-6 py-3 text-sm font-semibold text-primary-foreground glow-cyan hover:glow-cyan-strong disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!confirmed || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-cyan px-6 py-3 text-sm font-semibold text-primary-foreground glow-cyan hover:glow-cyan-strong disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[160px] justify-center"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>Submit Application <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ title, rows }: { title: string; rows: (readonly [string, React.ReactNode])[] }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">{title}</h4>
      <div className="grid sm:grid-cols-2 gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
