"use client";

import { useCallback, useState } from "react";
import { useExpensesContext } from "@/components/providers/ExpensesProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Expense } from "@/lib/types";
import type { NewExpense } from "@/hooks/useExpenses";

/**
 * Owns the add/edit form modal and the delete-confirmation dialog, wired to the
 * shared expense store and toast notifications. Drop `dialogs` somewhere in the
 * tree and call `openAdd` / `openEdit` / `confirmDelete` from anywhere.
 */
export function useExpenseDialogs() {
  const { addExpense, updateExpense, deleteExpense } = useExpensesContext();
  const { notify } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((expense: Expense) => {
    setEditing(expense);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSubmit = useCallback(
    (value: NewExpense) => {
      if (editing) {
        updateExpense(editing.id, value);
        notify("Expense updated");
      } else {
        addExpense(value);
        notify("Expense added");
      }
      setFormOpen(false);
    },
    [editing, updateExpense, addExpense, notify],
  );

  const confirmDelete = useCallback((expense: Expense) => {
    setPendingDelete(expense);
  }, []);

  const handleDelete = useCallback(() => {
    if (!pendingDelete) return;
    deleteExpense(pendingDelete.id);
    notify("Expense deleted", "info");
    setPendingDelete(null);
  }, [pendingDelete, deleteExpense, notify]);

  const dialogs = (
    <>
      <ExpenseForm
        open={formOpen}
        expense={editing}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this expense?"
        message={
          pendingDelete
            ? `“${pendingDelete.description}” will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );

  return { openAdd, openEdit, confirmDelete, dialogs };
}
