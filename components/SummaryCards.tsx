"use client";

import { Card } from "./ui/Card";
import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency } from "@/lib/format";
import type { Summary } from "@/lib/analytics";

interface SummaryCardsProps {
  summary: Summary;
  /** `YYYY` month label like "September". */
  monthLabel: string;
}

function StatCard({
  label,
  children,
  sub,
}: {
  label: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-2">{children}</div>
      {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </Card>
  );
}

export function SummaryCards({ summary, monthLabel }: SummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total spending"
        sub={`${summary.count} ${summary.count === 1 ? "expense" : "expenses"} recorded`}
      >
        <p className="text-3xl font-semibold tracking-tight">
          {formatCurrency(summary.total)}
        </p>
      </StatCard>

      <StatCard
        label={`Spent in ${monthLabel}`}
        sub={`${summary.thisMonthCount} ${summary.thisMonthCount === 1 ? "expense" : "expenses"} this month`}
      >
        <p className="text-2xl font-semibold tracking-tight">
          {formatCurrency(summary.thisMonthTotal)}
        </p>
      </StatCard>

      <StatCard label="Daily average" sub="Across your recorded range">
        <p className="text-2xl font-semibold tracking-tight">
          {formatCurrency(summary.dailyAverage)}
        </p>
      </StatCard>

      <StatCard
        label="Top category"
        sub={
          summary.topCategory
            ? `${Math.round(summary.topCategory.share * 100)}% of all spending`
            : "No spending yet"
        }
      >
        {summary.topCategory ? (
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={summary.topCategory.category} />
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(summary.topCategory.total)}
            </span>
          </div>
        ) : (
          <p className="text-2xl font-semibold text-slate-400">—</p>
        )}
      </StatCard>
    </div>
  );
}
