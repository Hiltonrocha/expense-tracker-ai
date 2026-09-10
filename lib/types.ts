export const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  /** Stable unique id. */
  id: string;
  /** ISO date string, `YYYY-MM-DD`. The day the money was spent. */
  date: string;
  /** Positive number in the app's single currency (USD for this demo). */
  amount: number;
  category: Category;
  /** Free text, 1–200 chars. */
  description: string;
  /** ISO timestamp of when the record was created. */
  createdAt: string;
}

/** Shape accepted by the form before it becomes a full `Expense`. */
export interface ExpenseDraft {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

export interface ExpenseFilters {
  /** Inclusive lower bound, `YYYY-MM-DD`, or "" for no bound. */
  from: string;
  /** Inclusive upper bound, `YYYY-MM-DD`, or "" for no bound. */
  to: string;
  /** A category to match, or "All" for every category. */
  category: Category | "All";
  /** Case-insensitive substring match on the description. */
  search: string;
}

export const EMPTY_FILTERS: ExpenseFilters = {
  from: "",
  to: "",
  category: "All",
  search: "",
};
