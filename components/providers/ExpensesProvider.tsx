"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useExpenses, type UseExpensesResult } from "@/hooks/useExpenses";

const ExpensesContext = createContext<UseExpensesResult | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const value = useExpenses();
  return (
    <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
  );
}

export function useExpensesContext(): UseExpensesResult {
  const ctx = useContext(ExpensesContext);
  if (!ctx) {
    throw new Error("useExpensesContext must be used within <ExpensesProvider>");
  }
  return ctx;
}
