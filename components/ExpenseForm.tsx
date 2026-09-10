"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { TextField, SelectField } from "./ui/Field";
import { CATEGORIES, type Category, type Expense, type ExpenseDraft } from "@/lib/types";
import { todayISO } from "@/lib/format";
import {
  DESCRIPTION_MAX,
  validateDraft,
  type FieldErrors,
} from "@/lib/validation";
import type { NewExpense } from "@/hooks/useExpenses";

interface ExpenseFormProps {
  open: boolean;
  /** When present the form is in edit mode and pre-filled. */
  expense?: Expense | null;
  onClose: () => void;
  onSubmit: (value: NewExpense) => void;
}

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

function draftFromExpense(expense: Expense | null | undefined): ExpenseDraft {
  return {
    date: expense?.date ?? todayISO(),
    amount: expense ? String(expense.amount) : "",
    category: expense?.category ?? "Food",
    description: expense?.description ?? "",
  };
}

export function ExpenseForm({ open, expense, onClose, onSubmit }: ExpenseFormProps) {
  const isEdit = Boolean(expense);
  const [draft, setDraft] = useState<ExpenseDraft>(() => draftFromExpense(expense));
  const [touched, setTouched] = useState<Record<keyof ExpenseDraft, boolean>>({
    date: false,
    amount: false,
    category: false,
    description: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Reset whenever the dialog is (re)opened for a different record.
  useEffect(() => {
    if (open) {
      setDraft(draftFromExpense(expense));
      setTouched({ date: false, amount: false, category: false, description: false });
      setSubmitting(false);
    }
  }, [open, expense]);

  const errors: FieldErrors = useMemo(() => validateDraft(draft), [draft]);
  const isValid = Object.keys(errors).length === 0;

  function set<K extends keyof ExpenseDraft>(key: K, value: ExpenseDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function blur(key: keyof ExpenseDraft) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function shownError(key: keyof ExpenseDraft): string | undefined {
    return touched[key] ? errors[key] : undefined;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ date: true, amount: true, category: true, description: true });
    if (!isValid) return;
    setSubmitting(true);
    onSubmit({
      date: draft.date,
      amount: Number(draft.amount),
      category: draft.category as Category,
      description: draft.description.trim(),
    });
  }

  const remaining = DESCRIPTION_MAX - draft.description.trim().length;

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit expense" : "Add expense"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" loading={submitting} disabled={!isValid}>
            {isEdit ? "Save changes" : "Add expense"}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          prefix="$"
          placeholder="0.00"
          value={draft.amount}
          onChange={(e) => set("amount", e.target.value)}
          onBlur={() => blur("amount")}
          error={shownError("amount")}
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Date"
            type="date"
            max={todayISO()}
            value={draft.date}
            onChange={(e) => set("date", e.target.value)}
            onBlur={() => blur("date")}
            error={shownError("date")}
          />
          <SelectField
            label="Category"
            options={CATEGORY_OPTIONS}
            value={draft.category}
            onChange={(e) => set("category", e.target.value as Category)}
            onBlur={() => blur("category")}
            error={shownError("category")}
          />
        </div>

        <TextField
          label="Description"
          placeholder="e.g. Lunch with the team"
          maxLength={DESCRIPTION_MAX + 20}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          onBlur={() => blur("description")}
          error={shownError("description")}
          hint={
            remaining >= 0
              ? `${remaining} characters left`
              : `${-remaining} characters over the limit`
          }
        />
      </form>
    </Modal>
  );
}
