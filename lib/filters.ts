import type { Expense, ExpenseFilters } from "./types";

/**
 * Apply every active filter with AND semantics and return matches sorted by
 * date descending (newest first), ties broken by `createdAt` descending.
 * Empty filter fields are ignored.
 */
export function applyFilters(
  expenses: Expense[],
  filters: ExpenseFilters,
): Expense[] {
  const search = filters.search.trim().toLowerCase();

  return expenses
    .filter((expense) => {
      if (filters.from && expense.date < filters.from) return false;
      if (filters.to && expense.date > filters.to) return false;
      if (filters.category !== "All" && expense.category !== filters.category) {
        return false;
      }
      if (search && !expense.description.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
}

export function isFilterActive(filters: ExpenseFilters): boolean {
  return (
    filters.from !== "" ||
    filters.to !== "" ||
    filters.category !== "All" ||
    filters.search.trim() !== ""
  );
}
