import type { Expense } from "./types";

const HEADERS = ["Date", "Category", "Description", "Amount"] as const;

/** RFC-4180 field escaping: quote when the value has a comma, quote or newline. */
function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Serialize expenses to a CSV string with a header row. Rows are written in the
 * order given (the caller passes already-filtered, already-sorted expenses).
 */
export function toCSV(expenses: Expense[]): string {
  const lines = [HEADERS.join(",")];
  for (const expense of expenses) {
    lines.push(
      [
        escapeField(expense.date),
        escapeField(expense.category),
        escapeField(expense.description),
        expense.amount.toFixed(2),
      ].join(","),
    );
  }
  return lines.join("\r\n");
}

/** `expenses-2026-09-10.csv` */
export function csvFilename(now: Date = new Date()): string {
  const iso = now.toISOString().slice(0, 10);
  return `expenses-${iso}.csv`;
}

/** Browser-only: trigger a download of `content` as `filename`. */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(["﻿", content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
