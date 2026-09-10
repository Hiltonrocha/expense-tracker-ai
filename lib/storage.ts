import { CATEGORIES, type Category, type Expense } from "./types";

export const STORAGE_KEY = "expense-tracker-ai/expenses/v1";

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

/** Narrow an unknown record to a valid `Expense`, or return `null`. */
function parseExpense(value: unknown): Expense | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const id = typeof raw.id === "string" ? raw.id : null;
  const date = typeof raw.date === "string" ? raw.date : null;
  const amount = typeof raw.amount === "number" && Number.isFinite(raw.amount) ? raw.amount : null;
  const description = typeof raw.description === "string" ? raw.description : null;

  if (!id || !date || amount === null || amount <= 0 || description === null) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!isCategory(raw.category)) return null;

  return {
    id,
    date,
    amount,
    category: raw.category,
    description,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

/** Read and validate the stored list. Any corruption yields `[]`. */
export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseExpense)
      .filter((e): e is Expense => e !== null);
  } catch {
    return [];
  }
}

/** Persist the list. Returns `false` if the write failed (e.g. quota, privacy). */
export function saveExpenses(expenses: Expense[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch {
    return false;
  }
}

/** Prefers the platform UUID generator, falls back for older browsers. */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
