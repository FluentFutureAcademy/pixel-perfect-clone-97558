import jsPDF from "jspdf";
import type { FormData, ScoreResult } from "./scoring";
import { calcEMI, fmtPKR } from "./history";

export type LetterKind = "APPROVED" | "CONDITIONAL" | "REJECTED";

const CYAN: [number, number, number] = [0, 188, 212];
const DARK: [number, number, number] = [10, 10, 10];
const GREEN: [number, number, number] = [34, 197, 94];
const AMBER: [number, number, number] = [234, 179, 8];
const RED: [number, number, number] = [220, 38, 38];
const MUTED: [number, number, number] = [110, 110, 120];

function refNo() {
  return "VIQ-" + Math.floor(100000 + Math.random() * 900000);
}

function sanitize(s: string) {
  return s.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "Applicant";
}

export function generateLetter(kind: LetterKind, data: FormData, result: ScoreResult): { filename: string; doc: jsPDF } {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const accent = kind === "APPROVED" ? GREEN : kind === "CONDITIONAL" ? AMBER : RED;

  // Header band
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 90, pageW, 4, "F");

  // Brand text in header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Vault", margin, 48);
  const vw = doc.getTextWidth("Vault");
  doc.setTextColor(...CYAN);
  doc.text("IQ", margin + vw, 48);
  doc.setTextColor(220, 220, 225);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Smart Loan Solutions", margin, 66);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text('"Your Financial Future, Unlocked"', margin, 80);

  // Reference + date (right)
  const ref = refNo();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 225);
  doc.text(`Ref: ${ref}`, pageW - margin, 48, { align: "right" });
  doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    pageW - margin, 64, { align: "right" });

  // Subject
  let y = 130;
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const subject =
    kind === "APPROVED" ? "Subject: Loan Approval Confirmation — VaultIQ" :
    kind === "CONDITIONAL" ? "Subject: Conditional Approval Notice — VaultIQ" :
    "Subject: Loan Application Update — VaultIQ";
  doc.text(subject, margin, y);

  // Status pill
  y += 28;
  doc.setFillColor(...accent);
  const label = kind === "APPROVED" ? "APPROVED" : kind === "CONDITIONAL" ? "CONDITIONALLY APPROVED" : "NOT APPROVED";
  const pillW = doc.getTextWidth(label) + 24;
  doc.roundedRect(margin, y - 14, pillW, 22, 11, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(label, margin + 12, y + 1);

  // Greeting + body
  y += 38;
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const firstName = (data.fullName || "Applicant").split(" ")[0];
  doc.text(`Dear ${firstName},`, margin, y);
  y += 22;

  const bodies: Record<LetterKind, string> = {
    APPROVED:
      "Congratulations! VaultIQ's AI-powered assessment has determined that your loan application has been APPROVED. Your financial profile demonstrates strong repayment capacity and meets VaultIQ's eligibility standards. Please find your sanctioned loan details below.",
    CONDITIONAL:
      "VaultIQ has reviewed your application and issued a CONDITIONAL APPROVAL based on your current profile. Final sanction is subject to fulfilling the conditions listed below. We are confident you can meet these requirements and unlock full approval.",
    REJECTED:
      "Thank you for choosing VaultIQ. After a thorough AI-powered review of your financial profile, we regret to inform you that your application has NOT been approved at this time. VaultIQ remains committed to helping you achieve your financial goals. Please review the improvement steps below and consider re-applying in 90 days.",
  };
  const lines = doc.splitTextToSize(bodies[kind], pageW - margin * 2);
  doc.text(lines, margin, y);
  y += lines.length * 14 + 14;

  // Details box
  doc.setDrawColor(225, 225, 230);
  doc.setFillColor(248, 250, 252);
  const boxTop = y;
  doc.roundedRect(margin, boxTop, pageW - margin * 2, 150, 10, 10, "FD");
  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text("Loan Summary", margin + 16, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const emi = calcEMI(data.loanAmount, 12, data.loanTerm);
  const rows: [string, string][] = [
    ["Applicant", data.fullName || "—"],
    ["Purpose", data.purpose],
    ["Loan Amount", fmtPKR(data.loanAmount)],
    ["Tenure", `${data.loanTerm} months`],
    ["Monthly EMI (est. @12%)", fmtPKR(emi)],
    ["Eligibility Score", `${result.score} / 100 · Risk: ${result.risk}`],
  ];
  rows.forEach(([k, v]) => {
    doc.setTextColor(...MUTED);
    doc.text(k, margin + 16, y);
    doc.setTextColor(...DARK);
    doc.text(v, pageW - margin - 16, y, { align: "right" });
    y += 16;
  });

  y = boxTop + 170;

  // Section list (recommendations/conditions/reasons)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  const heading =
    kind === "APPROVED" ? "Next Steps" :
    kind === "CONDITIONAL" ? "Conditions to Fulfil" :
    "Improvement Steps";
  doc.text(heading, margin, y);
  y += 14;

  const items: Record<LetterKind, string[]> = {
    APPROVED: [
      "Submit your documents within 14 days to lock in this offer.",
      "Set up auto-debit for on-time EMI payments.",
      "Keep credit utilisation under 30% to maximise future offers.",
    ],
    CONDITIONAL: [
      "Add a salaried co-applicant or guarantor to strengthen the profile.",
      "Reduce requested loan amount by ~15% or extend the tenure.",
      "Clear any existing high-interest EMIs prior to disbursement.",
    ],
    REJECTED: [
      "Build 6 months of clean, on-time credit history before reapplying.",
      "Lower the requested amount or extend tenure for a workable ratio.",
      "Increase declared monthly income or add a co-applicant.",
    ],
  };
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  items[kind].forEach((t) => {
    const wrapped = doc.splitTextToSize("•  " + t, pageW - margin * 2 - 16);
    doc.text(wrapped, margin + 8, y);
    y += wrapped.length * 14 + 4;
  });

  // Closing
  y += 12;
  doc.setTextColor(...DARK);
  doc.text("Warm regards,", margin, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.text("VaultIQ Loan Department", margin, y);

  // Footer
  const fy = pageH - 70;
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.8);
  doc.line(margin, fy, pageW - margin, fy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("VaultIQ Loan Department  ·  loans@vaultiq.com  ·  www.vaultiq.com", pageW / 2, fy + 16, { align: "center" });
  doc.text("© 2024 VaultIQ. All rights reserved.", pageW / 2, fy + 30, { align: "center" });
  const note = doc.splitTextToSize(
    "This letter is generated by VaultIQ AI Prediction System for informational purposes only. Final approval is subject to bank verification.",
    pageW - margin * 2,
  );
  doc.text(note, pageW / 2, fy + 44, { align: "center" });

  const kindLabel = kind === "APPROVED" ? "Approval" : kind === "CONDITIONAL" ? "Conditional" : "Rejection";
  const filename = `${kindLabel}_Letter_VaultIQ_${sanitize(data.fullName)}.pdf`;
  return { filename, doc };
}

export function downloadLetter(kind: LetterKind, data: FormData, result: ScoreResult) {
  const { filename, doc } = generateLetter(kind, data, result);
  doc.save(filename);
}
