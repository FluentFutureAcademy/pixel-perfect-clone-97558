import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Wizard } from "@/components/wizard";
import { ResultScreen } from "@/components/result";
import { EligibilitySimulator } from "@/components/eligibility-simulator";
import { Faq } from "@/components/faq";
import { SiteLayout } from "@/components/site-layout";
import type { FormData, ScoreResult } from "@/lib/scoring";
import { submitApplication } from "@/lib/submit-application";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VaultIQ — Smart Loan Intelligence" },
      { name: "description", content: "VaultIQ predicts your loan approval instantly using AI-powered financial analysis." },
      { property: "og:title", content: "VaultIQ — Smart Loan Intelligence" },
      { property: "og:description", content: "VaultIQ predicts your loan approval instantly using AI-powered financial analysis." },
    ],
  }),
  component: Page,
});

function Page() {
  const [submission, setSubmission] = useState<{ data: FormData; result: ScoreResult } | null>(null);

  const handleSubmit = async (d: FormData) => {
    try {
      const { result } = await submitApplication(d);
      toast.success("💾 Application saved to VaultIQ vault.");
      setSubmission({ data: d, result });
    } catch (err) {
      console.error("Loan application insert failed", err);
      toast.error("❌ Failed to save to VaultIQ vault. Please try again.");
      // fall back so the user still sees their result locally if storage is the only issue
      // but keep them on the form. Re-throw so wizard knows submission failed.
      throw err;
    }
  };

  const scrollToApply = () => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });

  return (
    <SiteLayout>
      <Hero onApply={scrollToApply} />
      <HowItWorks />
      <EligibilitySimulator />
      <Wizard onSubmit={handleSubmit} />
      <Faq />
      {submission && (
        <ResultScreen result={submission.result} data={submission.data} onReset={() => setSubmission(null)} />
      )}
    </SiteLayout>
  );
}
