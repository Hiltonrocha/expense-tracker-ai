import { describe, expect, it } from "vitest";
import { csvFilename, toCSV } from "./csv";
import type { Expense } from "./types";

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

describe("toCSV", () => {
  it("writes a header and one row per expense", () => {
    const csv = toCSV([
      make({ date: "2026-01-01", category: "Food", description: "Coffee", amount: 3.5 }),
      make({ date: "2026-01-02", category: "Bills", description: "Water", amount: 40 }),
    ]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("Date,Category,Description,Amount");
    expect(lines[1]).toBe("2026-01-01,Food,Coffee,3.50");
    expect(lines[2]).toBe("2026-01-02,Bills,Water,40.00");
  });

  it("quotes and escapes fields containing commas or quotes", () => {
    const csv = toCSV([
      make({ description: 'Dinner, "The Spot"', amount: 55 }),
    ]);
    expect(csv.split("\r\n")[1]).toBe('2026-01-10,Food,"Dinner, ""The Spot""",55.00');
  });

  it("emits just the header for an empty list", () => {
    expect(toCSV([])).toBe("Date,Category,Description,Amount");
  });
});

describe("csvFilename", () => {
  it("embeds the date", () => {
    expect(csvFilename(new Date("2026-09-10T10:00:00Z"))).toBe("expenses-2026-09-10.csv");
  });
});
