"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Expense } from "@/lib/types";
import {
  createId,
  loadExpenses,
  saveExpenses,
} from "@/lib/storage";

export interface NewExpense {
  date: string;
  amount: number;
  category: Expense["category"];
  description: string;
}

export interface UseExpensesResult {
  expenses: Expense[];
  loading: boolean;
  /** Set when the last persist attempt failed (quota / disabled storage). */
  error: string | null;
  addExpense: (input: NewExpense) => Expense;
  updateExpense: (id: string, input: NewExpense) => void;
  deleteExpense: (id: string) => void;
  replaceAll: (next: Expense[]) => void;
  clearAll: () => void;
}

export function useExpenses(): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstPersist = useRef(true);

  // Hydrate once on mount.
  useEffect(() => {
    setExpenses(loadExpenses());
    setLoading(false);
  }, []);

  // Persist after every change. The first run is the hydration commit itself —
  // skip it so we never write the empty initial state over stored data.
  useEffect(() => {
    if (firstPersist.current) {
      firstPersist.current = false;
      return;
    }
    const ok = saveExpenses(expenses);
    setError(ok ? null : "Changes could not be saved to this browser.");
  }, [expenses]);

  const addExpense = useCallback((input: NewExpense): Expense => {
    const expense: Expense = {
      ...input,
      description: input.description.trim(),
      id: createId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, input: NewExpense) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...input, description: input.description.trim() } : e,
      ),
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const replaceAll = useCallback((next: Expense[]) => {
    setExpenses(next);
  }, []);

  const clearAll = useCallback(() => {
    setExpenses([]);
  }, []);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceAll,
    clearAll,
  };
}
