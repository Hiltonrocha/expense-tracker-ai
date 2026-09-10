"use client";

import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";
import { Button } from "./ui/Button";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400 tabular-nums">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                  {expense.description}
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge category={expense.category} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(expense)}
                      aria-label={`Edit ${expense.description}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(expense)}
                      aria-label={`Delete ${expense.description}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="divide-y divide-slate-100 sm:hidden dark:divide-slate-800">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex flex-col gap-2 px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                  {expense.description}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {formatDate(expense.date)}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <CategoryBadge category={expense.category} />
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(expense)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(expense)}
                  className="text-red-600 dark:text-red-400"
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
