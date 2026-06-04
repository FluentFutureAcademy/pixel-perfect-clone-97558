import { supabase } from "@/integrations/supabase/client";
import { calcEMI, saveHistory } from "./history";
import { calculateScore, type FormData, type ScoreResult } from "./scoring";

export type SubmissionPayload = {
  result: ScoreResult;
  referenceNumber: string;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  interestRate: number;
  recommendations: string[];
  financialHealth: {
    score: number;
    badge: "Excellent" | "Good" | "Fair" | "Poor";
    advice: string[];
  };
};

function buildRecommendations(decision: ScoreResult["decision"]): string[] {
  if (decision === "APPROVED")
    return [
      "Lock in this rate by submitting documents within 14 days.",
      "Consider auto-debit to maintain a perfect repayment streak.",
      "Keep credit utilization under 30% to maximize future offers.",
    ];
  if (decision === "CONDITIONAL")
    return [
      "Add a salaried co-applicant to push your score above 70.",
      "Reduce loan amount by ~15% or extend tenure for stronger ratio.",
      "Clear any existing high-interest EMIs before disbursement.",
    ];
  return [
    "Build 6 months of clean credit history before reapplying.",
    "Lower the loan amount or extend tenure for a workable ratio.",
    "Increase declared monthly income or add a co-applicant.",
  ];
}

function buildFinancialHealth(d: FormData, decision: ScoreResult["decision"]) {
  const totalIncome = d.income + d.coIncome;
  const rate = decision === "APPROVED" ? 12 : 16;
  const newEmi = calcEMI(d.loanAmount, rate, d.loanTerm);
  const dti = totalIncome > 0 ? (d.emi + newEmi) / totalIncome : 1;
  const dtiPts = Math.max(0, Math.round(30 * (1 - Math.min(dti, 1))));
  const savings = totalIncome - d.emi - newEmi;
  const savingsPts = Math.max(
    0,
    Math.min(25, Math.round((savings / Math.max(totalIncome, 1)) * 50)),
  );
  const empPts = d.employment === "Salaried" ? 25 : 15;
  const depPts = { "0": 20, "1": 15, "2": 10, "3+": 5 }[d.dependents];
  const score = dtiPts + savingsPts + empPts + depPts;
  const badge =
    score >= 81 ? "Excellent" : score >= 61 ? "Good" : score >= 41 ? "Fair" : "Poor";

  const breakdown = [
    { label: "Debt-to-Income", points: dtiPts, max: 30 },
    { label: "Savings Potential", points: savingsPts, max: 25 },
    { label: "Employment Stability", points: empPts, max: 25 },
    { label: "Dependents Burden", points: depPts, max: 20 },
  ];
  const weakest = [...breakdown].sort(
    (a, b) => a.points / a.max - b.points / b.max,
  )[0];
  const tipMap: Record<string, string[]> = {
    "Debt-to-Income": [
      "Your monthly obligations consume too much of your income.",
      "Aim to keep total EMIs under 40% of household income.",
      "Consider a longer tenure or smaller principal to free up cashflow.",
    ],
    "Savings Potential": [
      "Little is left after EMIs — your savings buffer is thin.",
      "Trim discretionary spending and automate a fixed monthly save.",
      "Even ₨ 5,000 per month builds a meaningful emergency fund.",
    ],
    "Employment Stability": [
      "Self-employed income is harder to verify for lenders.",
      "Maintain audited tax returns and steady bank inflows for 12+ months.",
      "A salaried co-applicant can significantly improve your file.",
    ],
    "Dependents Burden": [
      "A larger family raises monthly outflows lenders factor in.",
      "Document any working co-applicants in the household.",
      "Build a higher emergency buffer to offset the obligation.",
    ],
  };
  return { score, badge: badge as "Excellent" | "Good" | "Fair" | "Poor", advice: tipMap[weakest.label] };
}

export async function submitApplication(d: FormData): Promise<SubmissionPayload> {
  const result = calculateScore(d);
  const referenceNumber = "VIQ-" + Math.floor(100000 + Math.random() * 900000);

  const interestRate =
    result.decision === "APPROVED" ? 12 : result.decision === "CONDITIONAL" ? 16 : 20;
  const monthlyEmi = calcEMI(d.loanAmount, interestRate, d.loanTerm);
  const totalRepayment = monthlyEmi * d.loanTerm;
  const totalInterest = totalRepayment - d.loanAmount;

  const recommendations = buildRecommendations(result.decision);
  const financialHealth = buildFinancialHealth(d, result.decision);

  const { error } = await externalSupabase.from("loan_applications").insert([
    {
      application_date: new Date().toLocaleDateString(),
      reference_number: referenceNumber,

      full_name: d.fullName,
      first_name: d.fullName.trim().split(/\s+/)[0] || d.fullName,
      age: d.age,
      gender: d.gender,
      marital_status: d.marital,
      dependents: d.dependents,
      education: d.education,

      employment_status: d.employment,
      monthly_income: d.income,
      coapplicant_income: d.coIncome || 0,
      existing_obligations: d.emi || 0,
      credit_history: d.creditHistory === 1 ? "Good" : "Poor",

      loan_purpose: d.purpose,
      loan_amount: d.loanAmount,
      loan_term: d.loanTerm,
      property_area: d.propertyArea,

      eligibility_score: result.score,
      decision: result.decision,
      risk_category: result.risk,
      interest_rate: interestRate,

      monthly_emi: Math.round(monthlyEmi),
      total_interest: Math.round(totalInterest),
      total_repayment: Math.round(totalRepayment),

      recommendations,

      financial_health_score: financialHealth.score,
      financial_health_badge: financialHealth.badge,
      financial_health_advice: financialHealth.advice,
    },
  ]);

  if (error) throw error;

  // Persist a local-only history record (DB rows are not readable by the client).
  try { saveHistory(d); } catch { /* ignore localStorage errors */ }



  return {
    result,
    referenceNumber,
    monthlyEmi,
    totalInterest,
    totalRepayment,
    interestRate,
    recommendations,
    financialHealth,
  };
}
