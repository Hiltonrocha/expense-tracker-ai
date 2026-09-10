import { CATEGORIES } from "@/lib/types";
import type {
  Category,
  ExportSelection,
  Expense,
  SelectionStats,
} from "./types";

/**
 * Apply the export selection (date window + category set) to a list of expenses
 * and return the matches newest-first, ties broken by `createdAt`. An empty
 * `categories` array means "no category filter".
 */
export function selectForExport(
  expenses: Expense[],
  selection: ExportSelection,
): Expense[] {
  const { start, end } = selection.range;
  const allowed =
    selection.categories.length > 0 ? new Set(selection.categories) : null;

  return expenses
    .filter((expense) => {
      if (start && expense.date < start) return false;
      if (end && expense.date > end) return false;
      if (allowed && !allowed.has(expense.category)) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
}

/** Summary numbers for a already-selected list, for the export summary bar. */
export function summarizeSelection(rows: Expense[]): SelectionStats {
  const perCategoryMap = new Map<
    Category,
    { category: Category; count: number; total: number }
  >();

  let total = 0;
  let earliest: string | null = null;
  let latest: string | null = null;

  for (const row of rows) {
    total += row.amount;
    if (earliest === null || row.date < earliest) earliest = row.date;
    if (latest === null || row.date > latest) latest = row.date;

    const entry = perCategoryMap.get(row.category) ?? {
      category: row.category,
      count: 0,
      total: 0,
    };
    entry.count += 1;
    entry.total += row.amount;
    perCategoryMap.set(row.category, entry);
  }

  const perCategory = CATEGORIES.filter((c) => perCategoryMap.has(c)).map(
    (c) => perCategoryMap.get(c)!,
  );

  return { count: rows.length, total, earliest, latest, perCategory };
}

/** Expand an empty category filter to the full list; pass others through as-is. */
export function resolveCategories(categories: Category[]): Category[] {
  return categories.length > 0 ? categories : [...CATEGORIES];
}
