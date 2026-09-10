"use client";

import { TextField, SelectField } from "./ui/Field";
import { Button } from "./ui/Button";
import { CATEGORIES, type ExpenseFilters as Filters } from "@/lib/types";
import { isFilterActive } from "@/lib/filters";
import { todayISO } from "@/lib/format";

interface ExpenseFiltersProps {
  value: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  /** Number of expenses matching the current filters, for the summary line. */
  resultCount: number;
  totalCount: number;
}

const CATEGORY_OPTIONS = [
  { value: "All", label: "All categories" },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function ExpenseFilters({
  value,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: ExpenseFiltersProps) {
  const active = isFilterActive(value);

  function patch(part: Partial<Filters>) {
    onChange({ ...value, ...part });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Search"
          type="search"
          placeholder="Description contains…"
          value={value.search}
          onChange={(e) => patch({ search: e.target.value })}
        />
        <SelectField
          label="Category"
          options={CATEGORY_OPTIONS}
          value={value.category}
          onChange={(e) => patch({ category: e.target.value as Filters["category"] })}
        />
        <TextField
          label="From"
          type="date"
          max={value.to || todayISO()}
          value={value.from}
          onChange={(e) => patch({ from: e.target.value })}
        />
        <TextField
          label="To"
          type="date"
          min={value.from || undefined}
          max={todayISO()}
          value={value.to}
          onChange={(e) => patch({ to: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{resultCount}</span>{" "}
          of {totalCount} {totalCount === 1 ? "expense" : "expenses"}
        </p>
        {active && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
