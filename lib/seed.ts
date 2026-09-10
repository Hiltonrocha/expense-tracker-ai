import type { Category, Expense } from "./types";
import { toISODate } from "./format";
import { createId } from "./storage";

interface SeedSpec {
  daysAgo: number;
  amount: number;
  category: Category;
  description: string;
}

const SPECS: SeedSpec[] = [
  { daysAgo: 0, amount: 12.75, category: "Food", description: "Lunch — deli sandwich" },
  { daysAgo: 1, amount: 48.2, category: "Food", description: "Weekly groceries" },
  { daysAgo: 1, amount: 2.9, category: "Transportation", description: "Subway fare" },
  { daysAgo: 3, amount: 64.0, category: "Bills", description: "Mobile phone plan" },
  { daysAgo: 4, amount: 19.99, category: "Entertainment", description: "Streaming subscription" },
  { daysAgo: 6, amount: 34.5, category: "Shopping", description: "Running socks + tee" },
  { daysAgo: 8, amount: 21.4, category: "Transportation", description: "Rideshare home" },
  { daysAgo: 11, amount: 9.5, category: "Food", description: "Coffee with a friend" },
  { daysAgo: 14, amount: 120.0, category: "Bills", description: "Electricity bill" },
  { daysAgo: 18, amount: 55.75, category: "Shopping", description: "Kitchen supplies" },
  { daysAgo: 23, amount: 42.0, category: "Entertainment", description: "Concert ticket" },
  { daysAgo: 27, amount: 15.3, category: "Other", description: "Gift wrap + card" },
  { daysAgo: 34, amount: 78.9, category: "Food", description: "Dinner out" },
  { daysAgo: 41, amount: 60.0, category: "Transportation", description: "Monthly transit pass" },
  { daysAgo: 52, amount: 210.0, category: "Shopping", description: "New winter jacket" },
  { daysAgo: 63, amount: 18.0, category: "Entertainment", description: "Cinema — two tickets" },
  { daysAgo: 74, amount: 95.4, category: "Bills", description: "Internet — quarterly" },
  { daysAgo: 88, amount: 26.6, category: "Food", description: "Brunch" },
];

/** A deterministic-ish set of realistic demo expenses spread over ~3 months. */
export function buildSeedExpenses(now: Date = new Date()): Expense[] {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return SPECS.map((spec, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - spec.daysAgo);
    return {
      id: createId(),
      date: toISODate(d),
      amount: spec.amount,
      category: spec.category,
      description: spec.description,
      createdAt: new Date(d.getTime() + i * 1000).toISOString(),
    };
  });
}
