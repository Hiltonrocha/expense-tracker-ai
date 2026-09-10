import { describe, expect, it } from "vitest";
import { buildCsv } from "./csv";
import type { Expense } from "../types";

function make(partial: Partial<Expense>): Expense {
  return {
    id: "1",
    date: "2026-01-10",
    amount: 10,
    category: "Food",
    description: "Thing",
    createdAt: "2026-01-10T12:00:00.000Z",
    ...partial,
  };
}

describe("buildCsv", () => {
  it("writes a Date,Category,Amount,Description header and one row per expense", () => {
    const csv = buildCsv([
      make({ date: "2026-01-01", category: "Food", description: "Coffee", amount: 3.5 }),
      make({ date: "2026-01-02", category: "Bills", description: "Water", amount: 40 }),
    ]);
    expect(csv.split("\r\n")).toEqual([
      "Date,Category,Amount,Description",
      "2026-01-01,Food,3.50,Coffee",
      "2026-01-02,Bills,40.00,Water",
    ]);
  });

  it("escapes commas, quotes and newlines per RFC 4180", () => {
    const csv = buildCsv([
      make({ description: 'Dinner, "The Spot"', amount: 55 }),
      make({ description: "line one\nline two", amount: 1 }),
    ]);
    const lines = csv.split("\r\n");
    expect(lines[1]).toBe('2026-01-10,Food,55.00,"Dinner, ""The Spot"""');
    expect(lines[2]).toBe('2026-01-10,Food,1.00,"line one\nline two"');
  });

  it("emits just the header for an empty list", () => {
    expect(buildCsv([])).toBe("Date,Category,Amount,Description");
  });
});
