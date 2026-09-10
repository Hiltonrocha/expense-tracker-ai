import { describe, expect, it } from "vitest";
import { resolveCategories, selectForExport, summarizeSelection } from "./selection";
import { CATEGORIES, type Expense } from "@/lib/types";

function make(partial: Partial<Expense>): Expense {
  return {
    id: Math.random().toString(36).slice(2),
    date: "2026-05-10",
    amount: 10,
    category: "Food",
    description: "Thing",
    createdAt: "2026-05-10T12:00:00.000Z",
    ...partial,
  };
}

const rows: Expense[] = [
  make({ date: "2026-01-05", amount: 20, category: "Food" }),
  make({ date: "2026-03-15", amount: 50, category: "Bills" }),
  make({ date: "2026-03-15", amount: 5, category: "Food", createdAt: "2026-03-15T09:00:00.000Z" }),
  make({ date: "2026-06-01", amount: 200, category: "Shopping" }),
];

describe("selectForExport", () => {
  it("returns everything newest-first when the selection is open", () => {
    const out = selectForExport(rows, { range: { start: "", end: "" }, categories: [] });
    expect(out.map((r) => r.date)).toEqual([
      "2026-06-01",
      "2026-03-15",
      "2026-03-15",
      "2026-01-05",
    ]);
  });

  it("breaks same-date ties by createdAt descending", () => {
    const out = selectForExport(rows, { range: { start: "", end: "" }, categories: [] });
    const sameDay = out.filter((r) => r.date === "2026-03-15");
    expect(sameDay[0].amount).toBe(50); // later createdAt first
    expect(sameDay[1].amount).toBe(5);
  });

  it("applies an inclusive date window", () => {
    const out = selectForExport(rows, {
      range: { start: "2026-03-01", end: "2026-03-31" },
      categories: [],
    });
    expect(out).toHaveLength(2);
    expect(out.every((r) => r.date.startsWith("2026-03"))).toBe(true);
  });

  it("filters by category, and treats an empty list as all categories", () => {
    const onlyFood = selectForExport(rows, {
      range: { start: "", end: "" },
      categories: ["Food"],
    });
    expect(onlyFood.map((r) => r.category)).toEqual(["Food", "Food"]);

    const all = selectForExport(rows, { range: { start: "", end: "" }, categories: [] });
    expect(all).toHaveLength(4);
  });

  it("supports a half-open range", () => {
    const fromMarch = selectForExport(rows, {
      range: { start: "2026-03-15", end: "" },
      categories: [],
    });
    expect(fromMarch).toHaveLength(3);
  });
});

describe("summarizeSelection", () => {
  it("totals amount, count, span and per-category rollup", () => {
    const stats = summarizeSelection(rows);
    expect(stats.count).toBe(4);
    expect(stats.total).toBe(275);
    expect(stats.earliest).toBe("2026-01-05");
    expect(stats.latest).toBe("2026-06-01");
    const food = stats.perCategory.find((c) => c.category === "Food");
    expect(food).toEqual({ category: "Food", count: 2, total: 25 });
  });

  it("handles an empty selection", () => {
    const stats = summarizeSelection([]);
    expect(stats).toEqual({
      count: 0,
      total: 0,
      earliest: null,
      latest: null,
      perCategory: [],
    });
  });
});

describe("resolveCategories", () => {
  it("expands an empty list to all categories", () => {
    expect(resolveCategories([])).toEqual([...CATEGORIES]);
  });
  it("passes a non-empty list through", () => {
    expect(resolveCategories(["Bills", "Food"])).toEqual(["Bills", "Food"]);
  });
});
