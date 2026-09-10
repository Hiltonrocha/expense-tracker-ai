import type { ExportContext, Expense } from "../types";

export interface JsonExportDocument {
  /** Schema marker so downstream consumers can detect the shape. */
  schema: "expense-tracker/export";
  version: 1;
  generatedAt: string;
  filters: {
    startDate: string | null;
    endDate: string | null;
    categories: string[];
    allCategories: boolean;
  };
  summary: {
    count: number;
    totalAmount: number;
  };
  expenses: Array<{
    id: string;
    date: string;
    category: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

/** Build the JSON export document (pretty-printed, 2-space indent). */
export function buildJson(rows: Expense[], context: ExportContext): string {
  const doc: JsonExportDocument = {
    schema: "expense-tracker/export",
    version: 1,
    generatedAt: context.generatedAt.toISOString(),
    filters: {
      startDate: context.range.start || null,
      endDate: context.range.end || null,
      categories: context.categories,
      allCategories: context.allCategories,
    },
    summary: {
      count: rows.length,
      totalAmount: Number(rows.reduce((sum, r) => sum + r.amount, 0).toFixed(2)),
    },
    expenses: rows.map((r) => ({
      id: r.id,
      date: r.date,
      category: r.category,
      amount: r.amount,
      description: r.description,
      createdAt: r.createdAt,
    })),
  };
  return JSON.stringify(doc, null, 2);
}
