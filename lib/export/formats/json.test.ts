import { describe, expect, it } from "vitest";
import { buildJson, type JsonExportDocument } from "./json";
import type { ExportContext, Expense } from "../types";

function make(partial: Partial<Expense>): Expense {
  return {
    id: "e1",
    date: "2026-01-10",
    amount: 12.5,
    category: "Food",
    description: "Lunch",
    createdAt: "2026-01-10T12:00:00.000Z",
    ...partial,
  };
}

const context: ExportContext = {
  generatedAt: new Date("2026-09-10T08:00:00Z"),
  range: { start: "2026-01-01", end: "2026-03-31" },
  categories: ["Food", "Bills"],
  allCategories: false,
};

describe("buildJson", () => {
  it("produces a versioned document with filters, summary and rows", () => {
    const json = buildJson(
      [make({ amount: 12.5 }), make({ id: "e2", amount: 7.25, category: "Bills" })],
      context,
    );
    const doc = JSON.parse(json) as JsonExportDocument;

    expect(doc.schema).toBe("expense-tracker/export");
    expect(doc.version).toBe(1);
    expect(doc.generatedAt).toBe("2026-09-10T08:00:00.000Z");
    expect(doc.filters).toEqual({
      startDate: "2026-01-01",
      endDate: "2026-03-31",
      categories: ["Food", "Bills"],
      allCategories: false,
    });
    expect(doc.summary).toEqual({ count: 2, totalAmount: 19.75 });
    expect(doc.expenses).toHaveLength(2);
    expect(doc.expenses[0]).toMatchObject({ id: "e1", amount: 12.5 });
  });

  it("nulls out unbounded filter dates and is pretty-printed", () => {
    const json = buildJson([], {
      ...context,
      range: { start: "", end: "" },
      allCategories: true,
    });
    const doc = JSON.parse(json) as JsonExportDocument;
    expect(doc.filters.startDate).toBeNull();
    expect(doc.filters.endDate).toBeNull();
    expect(doc.summary).toEqual({ count: 0, totalAmount: 0 });
    expect(json).toContain("\n  "); // 2-space indentation
  });

  it("rounds the summary total to cents", () => {
    const json = buildJson(
      [make({ amount: 0.1 }), make({ amount: 0.2 })],
      context,
    );
    const doc = JSON.parse(json) as JsonExportDocument;
    expect(doc.summary.totalAmount).toBe(0.3);
  });
});
