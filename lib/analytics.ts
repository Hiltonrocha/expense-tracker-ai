import { CATEGORIES, type Category, type Expense } from "./types";
import { formatMonth, parseISODate, toISODate } from "./format";

export interface CategoryTotal {
  category: Category;
  total: number;
  /** Share of the grand total, 0–1. `0` when the grand total is 0. */
  share: number;
  count: number;
}

export interface MonthlyTotal {
  /** `YYYY-MM`. */
  key: string;
  /** `"Sep 2026"`. */
  label: string;
  total: number;
}

export interface Summary {
  total: number;
  count: number;
  thisMonthTotal: number;
  thisMonthCount: number;
  /** Mean of the per-day totals across the span that has expenses. */
  dailyAverage: number;
  topCategory: CategoryTotal | null;
  byCategory: CategoryTotal[];
}

function sum(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}

/** `YYYY-MM` for the month containing `iso`. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function currentMonthKey(now: Date = new Date()): string {
  return toISODate(now).slice(0, 7);
}

/** Per-category totals, always all six categories, sorted by total desc. */
export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const grand = sum(expenses);
  const totals = new Map<Category, { total: number; count: number }>();
  for (const category of CATEGORIES) {
    totals.set(category, { total: 0, count: 0 });
  }
  for (const expense of expenses) {
    const entry = totals.get(expense.category);
    if (entry) {
      entry.total += expense.amount;
      entry.count += 1;
    }
  }
  return [...totals.entries()]
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      share: grand > 0 ? total / grand : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Totals for the last `months` calendar months up to and including the month of
 * `now`, oldest first. Months with no expenses are present with `total: 0` so
 * the trend chart has a continuous axis.
 */
export function monthlyTotals(
  expenses: Expense[],
  months = 6,
  now: Date = new Date(),
): MonthlyTotal[] {
  const buckets: MonthlyTotal[] = [];
  const anchor = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    const key = toISODate(d).slice(0, 7);
    buckets.push({ key, label: formatMonth(key), total: 0 });
  }

  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const expense of expenses) {
    const bucket = index.get(monthKey(expense.date));
    if (bucket) bucket.total += expense.amount;
  }
  return buckets;
}

export function summarize(expenses: Expense[], now: Date = new Date()): Summary {
  const byCategory = totalsByCategory(expenses);
  const thisMonth = currentMonthKey(now);
  const thisMonthExpenses = expenses.filter(
    (e) => monthKey(e.date) === thisMonth,
  );

  let dailyAverage = 0;
  if (expenses.length > 0) {
    const times = expenses
      .map((e) => parseISODate(e.date)?.getTime())
      .filter((t): t is number => typeof t === "number");
    if (times.length > 0) {
      const spanDays =
        Math.round((Math.max(...times) - Math.min(...times)) / 86_400_000) + 1;
      dailyAverage = sum(expenses) / Math.max(spanDays, 1);
    }
  }

  const topCategory = byCategory.find((c) => c.total > 0) ?? null;

  return {
    total: sum(expenses),
    count: expenses.length,
    thisMonthTotal: sum(thisMonthExpenses),
    thisMonthCount: thisMonthExpenses.length,
    dailyAverage,
    topCategory,
    byCategory,
  };
}
