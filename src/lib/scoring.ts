export type FormData = {
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  marital: "Single" | "Married" | "Divorced";
  dependents: "0" | "1" | "2" | "3+";
  education: "Graduate" | "Not Graduate";
  employment: "Salaried" | "Self-Employed";
  income: number;
  coIncome: number;
  emi: number;
  creditHistory: 0 | 1;
  purpose: "Home" | "Car" | "Education" | "Business" | "Personal" | "Medical";
  loanAmount: number;
  loanTerm: 6 | 12 | 24 | 36 | 48 | 60;
  propertyArea: "Urban" | "Semi-Urban" | "Rural";
};

export type ScoreResult = {
  score: number;
  decision: "APPROVED" | "CONDITIONAL" | "REJECTED";
  risk: "Low" | "Medium" | "High";
  breakdown: { label: string; points: number }[];
};

export function calculateScore(d: FormData): ScoreResult {
  const breakdown: { label: string; points: number }[] = [];
  let score = 0;

  const creditPts = d.creditHistory === 1 ? 35 : 0;
  score += creditPts;
  breakdown.push({ label: "Credit History", points: creditPts });

  const totalIncome = d.income + d.coIncome;
  const ratio = d.loanAmount > 0 ? (totalIncome * d.loanTerm) / d.loanAmount : 0;
  let ratioPts = 0;
  if (ratio >= 1.5) ratioPts = 25;
  else if (ratio >= 1.0) ratioPts = 15;
  else if (ratio >= 0.5) ratioPts = 8;
  score += ratioPts;
  breakdown.push({ label: `Income-to-Loan Ratio (${ratio.toFixed(2)})`, points: ratioPts });

  const empPts = d.employment === "Salaried" ? 10 : 6;
  score += empPts;
  breakdown.push({ label: "Employment", points: empPts });

  const eduPts = d.education === "Graduate" ? 8 : 4;
  score += eduPts;
  breakdown.push({ label: "Education", points: eduPts });

  const depMap = { "0": 7, "1": 5, "2": 3, "3+": 1 } as const;
  const depPts = depMap[d.dependents];
  score += depPts;
  breakdown.push({ label: "Dependents", points: depPts });

  const areaMap = { Urban: 8, "Semi-Urban": 6, Rural: 3 } as const;
  const areaPts = areaMap[d.propertyArea];
  score += areaPts;
  breakdown.push({ label: "Property Area", points: areaPts });

  const maritalMap = { Married: 5, Single: 3, Divorced: 2 } as const;
  const marPts = maritalMap[d.marital];
  score += marPts;
  breakdown.push({ label: "Marital Status", points: marPts });

  const decision: ScoreResult["decision"] =
    score >= 70 ? "APPROVED" : score >= 50 ? "CONDITIONAL" : "REJECTED";
  const risk: ScoreResult["risk"] = score >= 70 ? "Low" : score >= 50 ? "Medium" : "High";

  return { score: Math.min(score, 100), decision, risk, breakdown };
}

export const defaultFormData: FormData = {
  fullName: "",
  age: 30,
  gender: "Male",
  marital: "Single",
  dependents: "0",
  education: "Graduate",
  employment: "Salaried",
  income: 80000,
  coIncome: 0,
  emi: 5000,
  creditHistory: 1,
  purpose: "Home",
  loanAmount: 500000,
  loanTerm: 24,
  propertyArea: "Urban",
};
