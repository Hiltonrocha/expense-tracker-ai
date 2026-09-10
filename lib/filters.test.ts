import { describe, expect, it } from "vitest";
import { applyFilters, isFilterActive } from "./filters";
import { EMPTY_FILTERS, type Expense } from "./types";

function make(partial: Partial<Expense>): Expense {
  return {
    id: Math.random().toString(36),
    date: "2026-01-10",
    amount: 10,
    category: "Food",
    description: "Thing",
    createdAt: "2026-01-10T12:00:00.000Z",
    ...partial,
  };
}

const data: Expense[] = [
  make({ id: "a", date: "2026-01-01", category: "Food", description: "Coffee beans", createdAt: "2026-01-01T09:00:00Z" }),
  make({ id: "b", date: "2026-01-15", category: "Bills", description: "Electric bill", createdAt: "2026-01-15T09:00:00Z" }),
  make({ id: "c", date: "2026-02-01", category: "Food", description: "Grocery run", createdAt: "2026-02-01T09:00:00Z" }),
  make({ id: "d", date: "2026-02-01", category: "Shopping", description: "New shoes", createdAt: "2026-02-01T18:00:00Z" }),
];

describe("applyFilters", () => {
  it("returns everything, newest first, with empty filters", () => {
    const result = applyFilters(data, EMPTY_FILTERS);
    expect(result.map((e) => e.id)).toEqual(["d", "c", "b", "a"]);
  });

  it("filters by inclusive date range", () => {
    const result = applyFilters(data, { ...EMPTY_FILTERS, from: "2026-01-15", to: "2026-02-01" });
    expect(result.map((e) => e.id).sort()).toEqual(["b", "c", "d"]);
  });

  it("filters by category", () => {
    const result = applyFilters(data, { ...EMPTY_FILTERS, category: "Food" });
    expect(result.map((e) => e.id).sort()).toEqual(["a", "c"]);
  });

  it("filters by case-insensitive description search", () => {
    const result = applyFilters(data, { ...EMPTY_FILTERS, search: "BILL" });
    expect(result.map((e) => e.id)).toEqual(["b"]);
  });

  it("combines filters with AND", () => {
    const result = applyFilters(data, {
      ...EMPTY_FILTERS,
      category: "Food",
      from: "2026-01-20",
    });
    expect(result.map((e) => e.id)).toEqual(["c"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...data];
    applyFilters(data, EMPTY_FILTERS);
    expect(data).toEqual(copy);
  });
});

describe("isFilterActive", () => {
  it("is false for the empty filter set", () => {
    expect(isFilterActive(EMPTY_FILTERS)).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTERS, search: "   " })).toBe(false);
  });

  it("is true when any field is set", () => {
    expect(isFilterActive({ ...EMPTY_FILTERS, category: "Bills" })).toBe(true);
    expect(isFilterActive({ ...EMPTY_FILTERS, from: "2026-01-01" })).toBe(true);
  });
});
