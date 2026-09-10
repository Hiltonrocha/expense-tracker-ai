"use client";

import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { useExpensesContext } from "./providers/ExpensesProvider";
import { useToast } from "./providers/ToastProvider";
import { buildSeedExpenses } from "@/lib/seed";

export function EmptyExpensesState({ onAdd }: { onAdd: () => void }) {
  const { replaceAll } = useExpensesContext();
  const { notify } = useToast();

  return (
    <Card>
      <EmptyState
        icon="💸"
        title="No expenses yet"
        description="Add your first expense to start tracking, or load a set of sample data to explore the app."
        action={
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Button onClick={onAdd}>Add expense</Button>
            <Button
              variant="secondary"
              onClick={() => {
                replaceAll(buildSeedExpenses());
                notify("Sample data loaded");
              }}
            >
              Load sample data
            </Button>
          </div>
        }
      />
    </Card>
  );
}
