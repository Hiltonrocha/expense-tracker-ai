const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** `1234.5` -> `"$1,234.50"`. Non-finite input renders as `"$0.00"`. */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return currencyFormatter.format(0);
  return currencyFormatter.format(amount);
}

/** `1234567` -> `"$1.2M"`. For axis ticks and tight stat tiles. */
export function formatCompactCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return compactCurrencyFormatter.format(0);
  return compactCurrencyFormatter.format(amount);
}

/** `"2026-09-10"` -> `"Sep 10, 2026"`. Invalid input is returned unchanged. */
export function formatDate(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** `"2026-09"` -> `"Sep 2026"`. */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  if (!year || !month) return yearMonth;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Parse a `YYYY-MM-DD` string into a local-noon `Date` (noon avoids the
 * timezone-rollover bug where `new Date("2026-09-10")` lands on the 9th in
 * negative-offset zones). Returns `null` for anything malformed.
 */
export function parseISODate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Today as `YYYY-MM-DD` in the user's local timezone. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** A `Date` -> `YYYY-MM-DD` using local calendar fields. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
