"use client";

import { useMemo, useState } from "react";
import { useExpensesContext } from "@/components/providers/ExpensesProvider";
import { useExpenseDialogs } from "@/hooks/useExpenseDialogs";
import { useToast } from "@/components/providers/ToastProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExpenseFilters } from "@/components/ExpenseFilters";
import { ExpenseList } from "@/components/ExpenseList";
import { EmptyExpensesState } from "@/components/EmptyExpensesState";
import { ListSkeleton } from "@/components/Skeleton";
import { StorageWarning } from "@/components/StorageWarning";
import { applyFilters } from "@/lib/filters";
import { csvFilename, downloadCSV, toCSV } from "@/lib/csv";
import { formatCurrency } from "@/lib/format";
import { EMPTY_FILTERS, type ExpenseFilters as Filters } from "@/lib/types";

export default function ExpensesPage() {
  const { expenses, loading, error, clearAll } = useExpensesContext();
  const { openAdd, openEdit, confirmDelete, dialogs } = useExpenseDialogs();
  const { notify } = useToast();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [clearOpen, setClearOpen] = useState(false);

  const filtered = useMemo(
    () => applyFilters(expenses, filters),
    [expenses, filters],
  );

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  );

  function handleExport() {
    if (filtered.length === 0) return;
    downloadCSV(toCSV(filtered), csvFilename());
    notify(`Exported ${filtered.length} ${filtered.length === 1 ? "row" : "rows"} to CSV`);
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Search, filter, edit and export every expense you've logged."
        action={
          expenses.length > 0 ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleExport} disabled={filtered.length === 0}>
                Export CSV
              </Button>
              <Button onClick={openAdd}>Add expense</Button>
            </div>
          ) : undefined
        }
      />

      {error && <StorageWarning message={error} />}

      {loading ? (
        <ListSkeleton />
      ) : expenses.length === 0 ? (
        <EmptyExpensesState onAdd={openAdd} />
      ) : (
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <ExpenseFilters
              value={filters}
              onChange={setFilters}
              onReset={() => setFilters(EMPTY_FILTERS)}
              resultCount={filtered.length}
              totalCount={expenses.length}
            />
          </Card>

          <Card className="overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No expenses match your filters"
                description="Try widening the date range or clearing the search."
                action={
                  <Button variant="secondary" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <ExpenseList
                  expenses={filtered}
                  onEdit={openEdit}
                  onDelete={confirmDelete}
                />
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-slate-500 dark:text-slate-400">
                    {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(filteredTotal)}
                  </span>
                </div>
              </>
            )}
          </Card>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearOpen(true)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Delete all expenses
            </Button>
          </div>
        </div>
      )}

      {dialogs}

      <ConfirmDialog
        open={clearOpen}
        title="Delete all expenses?"
        message={`This permanently removes all ${expenses.length} expenses from this browser. This cannot be undone.`}
        confirmLabel="Delete everything"
        destructive
        onConfirm={() => {
          clearAll();
          setClearOpen(false);
          setFilters(EMPTY_FILTERS);
          notify("All expenses deleted", "info");
        }}
        onCancel={() => setClearOpen(false)}
      />
    </>
  );
}
