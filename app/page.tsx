"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useExpensesContext } from "@/components/providers/ExpensesProvider";
import { useExpenseDialogs } from "@/hooks/useExpenseDialogs";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SummaryCards } from "@/components/SummaryCards";
import { SpendingCharts } from "@/components/SpendingCharts";
import { ExpenseList } from "@/components/ExpenseList";
import { EmptyExpensesState } from "@/components/EmptyExpensesState";
import { DashboardSkeleton } from "@/components/Skeleton";
import { StorageWarning } from "@/components/StorageWarning";
import { ExportLauncher } from "@/components/export/ExportLauncher";
import { monthlyTotals, summarize } from "@/lib/analytics";
import { applyFilters } from "@/lib/filters";
import { EMPTY_FILTERS } from "@/lib/types";

const RECENT_COUNT = 5;

export default function DashboardPage() {
  const { expenses, loading, error } = useExpensesContext();
  const { openAdd, openEdit, confirmDelete, dialogs } = useExpenseDialogs();

  const summary = useMemo(() => summarize(expenses), [expenses]);
  const monthly = useMemo(() => monthlyTotals(expenses, 6), [expenses]);
  const recent = useMemo(
    () => applyFilters(expenses, EMPTY_FILTERS).slice(0, RECENT_COUNT),
    [expenses],
  );

  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long" });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of where your money is going."
        action={
          expenses.length > 0 ? (
            <div className="flex gap-2">
              <ExportLauncher />
              <Button onClick={openAdd}>Add expense</Button>
            </div>
          ) : undefined
        }
      />

      {error && <StorageWarning message={error} />}

      {loading ? (
        <DashboardSkeleton />
      ) : expenses.length === 0 ? (
        <EmptyExpensesState onAdd={openAdd} />
      ) : (
        <div className="space-y-6">
          <SummaryCards summary={summary} monthLabel={monthLabel} />
          <SpendingCharts byCategory={summary.byCategory} monthly={monthly} />

          <Card>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold">Recent expenses</h2>
              <Link
                href="/expenses"
                className="focus-ring rounded text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View all →
              </Link>
            </div>
            <ExpenseList expenses={recent} onEdit={openEdit} onDelete={confirmDelete} />
          </Card>
        </div>
      )}

      {dialogs}
    </>
  );
}
