import { describe, expect, it } from "vitest";
import {
  monthlyTotals,
  monthKey,
  summarize,
  totalsByCategory,
} from "./analytics";
import type { Expense } from "./types";

function make(partial: Partial<Expense>): Expense {
  return {
    id: Math.random().toString(36),
    date: "2026-06-10",
    amount: 10,
    category: "Food",
    description: "Thing",
    createdAt: "2026-06-10T12:00:00.000Z",
    ...partial,
  };
}

const NOW = new Date(2026, 5, 15, 12); // 15 Jun 2026

const data: Expense[] = [
  make({ date: "2026-06-01", amount: 100, category: "Food" }),
  make({ date: "2026-06-10", amount: 50, category: "Food" }),
  make({ date: "2026-06-12", amount: 200, category: "Bills" }),
  make({ date: "2026-05-20", amount: 80, category: "Shopping" }),
  make({ date: "2026-03-05", amount: 40, category: "Entertainment" }),
];

describe("monthKey", () => {
  it("extracts YYYY-MM", () => {
    expect(monthKey("2026-06-10")).toBe("2026-06");
  });
});

describe("totalsByCategory", () => {
  it("returns all six categories sorted by total desc with shares", () => {
    const totals = totalsByCategory(data);
    expect(totals).toHaveLength(6);
    expect(totals[0]).toMatchObject({ category: "Bills", total: 200 });
    expect(totals[1]).toMatchObject({ category: "Food", total: 150, count: 2 });
    const grand = 470;
    expect(totals[0].share).toBeCloseTo(200 / grand);
    expect(totals.find((t) => t.category === "Transportation")).toMatchObject({
      total: 0,
      share: 0,
    });
  });

  it("keeps shares at 0 for an empty list", () => {
    for (const t of totalsByCategory([])) {
      expect(t.total).toBe(0);
      expect(t.share).toBe(0);
    }
  });
});

describe("monthlyTotals", () => {
  it("produces a continuous window oldest-first", () => {
    const months = monthlyTotals(data, 6, NOW);
    expect(months.map((m) => m.key)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
    ]);
    expect(months[2].total).toBe(40); // March
    expect(months[4].total).toBe(80); // May
    expect(months[5].total).toBe(350); // June
    expect(months[0].total).toBe(0);
  });

  it("ignores expenses outside the window", () => {
    const older = [make({ date: "2025-01-01", amount: 999 })];
    const months = monthlyTotals(older, 6, NOW);
    expect(months.every((m) => m.total === 0)).toBe(true);
  });
});

describe("summarize", () => {
  it("computes totals, this-month and top category", () => {
    const s = summarize(data, NOW);
    expect(s.total).toBe(470);
    expect(s.count).toBe(5);
    expect(s.thisMonthTotal).toBe(350);
    expect(s.thisMonthCount).toBe(3);
    expect(s.topCategory?.category).toBe("Bills");
    expect(s.dailyAverage).toBeGreaterThan(0);
  });

  it("handles an empty list without dividing by zero", () => {
    const s = summarize([], NOW);
    expect(s.total).toBe(0);
    expect(s.dailyAverage).toBe(0);
    expect(s.topCategory).toBeNull();
  });
});
