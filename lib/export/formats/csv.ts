import type { Expense } from "../types";

export const CSV_COLUMNS = ["Date", "Category", "Amount", "Description"] as const;

/** RFC-4180 field escaping: wrap in quotes when the value holds a comma, quote or newline. */
function escapeField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Serialize expenses to an RFC-4180 CSV string (CRLF line endings, header row
 * first). Rows are written in the order given.
 */
export function buildCsv(rows: Expense[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(
      [
        escapeField(row.date),
        escapeField(row.category),
        row.amount.toFixed(2),
        escapeField(row.description),
      ].join(","),
    );
  }
  return lines.join("\r\n");
}
