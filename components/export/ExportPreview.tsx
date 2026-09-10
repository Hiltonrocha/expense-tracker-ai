"use client";

import { CategoryBadge } from "@/components/CategoryBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/lib/types";
import type { SelectionStats } from "@/lib/export";

const PREVIEW_LIMIT = 8;

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </dt>
      <dd className="truncate text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}

export function ExportSummaryBar({ stats }: { stats: SelectionStats }) {
  const span =
    stats.earliest && stats.latest
      ? stats.earliest === stats.latest
        ? formatDate(stats.earliest)
        : `${formatDate(stats.earliest)} – ${formatDate(stats.latest)}`
      : "—";

  return (
    <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40 sm:grid-cols-4">
      <SummaryStat label="Records" value={stats.count} />
      <SummaryStat label="Total" value={formatCurrency(stats.total)} />
      <SummaryStat label="Categories" value={stats.perCategory.length || "—"} />
      <SummaryStat label="Date span" value={span} />
    </dl>
  );
}

export function ExportPreviewTable({ rows }: { rows: Expense[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Nothing matches these options
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Widen the date range or include more categories.
        </p>
      </div>
    );
  }

  const visible = rows.slice(0, PREVIEW_LIMIT);
  const hidden = rows.length - visible.length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Date</th>
              <th scope="col" className="px-3 py-2 font-medium">Category</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Amount</th>
              <th scope="col" className="px-3 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums text-slate-600 dark:text-slate-300">
                  {formatDate(row.date)}
                </td>
                <td className="px-3 py-2">
                  <CategoryBadge category={row.category} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums">
                  {formatCurrency(row.amount)}
                </td>
                <td className="max-w-[16rem] truncate px-3 py-2 text-slate-600 dark:text-slate-300">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hidden > 0 && (
        <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
          Showing first {visible.length} of {rows.length} rows — all {rows.length}{" "}
          will be exported.
        </p>
      )}
    </div>
  );
}
