import type { FormData, ScoreResult } from "./scoring";
import { calculateScore } from "./scoring";

export type HistoryRecord = {
  id: string;
  date: number;
  data: FormData;
  result: ScoreResult;
};

const HISTORY_KEY = "vaultiq_history";

function readStore(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(records: HistoryRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, 50)));
}

export async function loadHistory(): Promise<HistoryRecord[]> {
  return readStore().sort((a, b) => b.date - a.date);
}

export function saveHistory(data: FormData): HistoryRecord {
  const record: HistoryRecord = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `vq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: Date.now(),
    data,
    result: calculateScore(data),
  };
  const current = readStore();
  writeStore([record, ...current]);
  return record;
}

export async function deleteHistory(id: string) {
  writeStore(readStore().filter((r) => r.id !== id));
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
