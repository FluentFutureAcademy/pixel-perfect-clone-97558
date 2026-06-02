import type { FormData, ScoreResult } from "./scoring";
import { calculateScore } from "./scoring";
import { externalSupabase } from "@/lib/external-supabase";
import type { Database } from "@/integrations/supabase/types";

export type HistoryRecord = {
  id: string;
  date: number;
  data: FormData;
  result: ScoreResult;
};

type LoanApplicationRow = Database["public"]["Tables"]["loan_applications"]["Row"];

function rowToHistory(row: LoanApplicationRow): HistoryRecord {
  const data: FormData = {
    fullName: row.full_name,
    age: row.age ?? 30,
    gender: (row.gender ?? "Male") as FormData["gender"],
    marital: (row.marital_status ?? "Single") as FormData["marital"],
    dependents: (row.dependents ?? "0") as FormData["dependents"],
    education: (row.education ?? "Graduate") as FormData["education"],
    employment: (row.employment_status ?? "Salaried") as FormData["employment"],
    income: Number(row.monthly_income ?? 0),
    coIncome: Number(row.coapplicant_income ?? 0),
    emi: Number(row.existing_obligations ?? 0),
    creditHistory: row.credit_history === "Poor" ? 0 : 1,
    purpose: (row.loan_purpose ?? "Home") as FormData["purpose"],
    loanAmount: Number(row.loan_amount ?? 0),
    loanTerm: (row.loan_term ?? 24) as FormData["loanTerm"],
    propertyArea: (row.property_area ?? "Urban") as FormData["propertyArea"],
  };

  return {
    id: row.id,
    date: new Date(row.created_at).getTime(),
    data,
    result: calculateScore(data),
  };
}

export async function loadHistory(): Promise<HistoryRecord[]> {
  const { data, error } = await externalSupabase
    .from("loan_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map(rowToHistory);
}

export async function deleteHistory(id: string) {
  const { error } = await externalSupabase.from("loan_applications").delete().eq("id", id);
  if (error) throw error;
}

const PREFILL_KEY = "vaultiq_prefill";
export function setPrefill(data: Partial<FormData>) {
  sessionStorage.setItem(PREFILL_KEY, JSON.stringify(data));
}
export function consumePrefill(): Partial<FormData> | null {
  const v = sessionStorage.getItem(PREFILL_KEY);
  if (!v) return null;
  sessionStorage.removeItem(PREFILL_KEY);
  try { return JSON.parse(v); } catch { return null; }
}

export function fmtPKR(n: number) {
  return "₨ " + Math.round(n).toLocaleString("en-PK");
}

export function calcEMI(principal: number, annualRate: number, months: number) {
  if (months <= 0 || principal <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}
