"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { useTheme } from "./providers/ThemeProvider";
import { CATEGORY_META } from "@/lib/categories";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { CategoryTotal, MonthlyTotal } from "@/lib/analytics";
import type { Category } from "@/lib/types";

interface SpendingChartsProps {
  byCategory: CategoryTotal[];
  monthly: MonthlyTotal[];
}

const CHROME = {
  light: { grid: "#e1e0d9", axis: "#898781", series: "#2a78d6", cursor: "#0b0b0b0d" },
  dark: { grid: "#2c2c2a", axis: "#898781", series: "#3987e5", cursor: "#ffffff0d" },
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

interface TipEntry {
  payload: { fill?: string };
  value: number;
}

function Tip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TipEntry[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-slate-50">
        {formatCurrency(entry.value)}
      </p>
    </div>
  );
}

export function SpendingCharts({ byCategory, monthly }: SpendingChartsProps) {
  const { theme } = useTheme();
  const c = CHROME[theme];

  const categoryData = byCategory
    .filter((row) => row.total > 0)
    .map((row) => ({
      name: row.category,
      value: Number(row.total.toFixed(2)),
      fill: CATEGORY_META[row.category as Category][theme],
    }));

  const monthlyData = monthly.map((m) => ({
    name: m.label.replace(/ \d{4}$/, ""),
    fullLabel: m.label,
    value: Number(m.total.toFixed(2)),
  }));

  const hasCategory = categoryData.length > 0;
  const hasMonthly = monthlyData.some((m) => m.value > 0);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartCard title="Spending by category" subtitle="All time, largest first">
        {hasCategory ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
                barCategoryGap={8}
              >
                <CartesianGrid horizontal={false} stroke={c.grid} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCompactCurrency(Number(v))}
                  tick={{ fill: c.axis, fontSize: 11 }}
                  axisLine={{ stroke: c.grid }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tick={{ fill: c.axis, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<Tip />} cursor={{ fill: c.cursor }} />
                <Bar dataKey="value" maxBarSize={24} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(v: number) => formatCurrency(v)}
                    className="fill-slate-600 dark:fill-slate-300"
                    style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="No category data yet"
            description="Add an expense to see how your spending splits across categories."
          />
        )}
      </ChartCard>

      <ChartCard title="Monthly spending" subtitle="Last 6 months">
        {hasMonthly ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 8, bottom: 4, left: 8 }}
                barCategoryGap={8}
              >
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: c.axis, fontSize: 12 }}
                  axisLine={{ stroke: c.grid }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatCompactCurrency(Number(v))}
                  tick={{ fill: c.axis, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  content={<Tip />}
                  cursor={{ fill: c.cursor }}
                  labelFormatter={(_, p) => p?.[0]?.payload?.fullLabel ?? ""}
                />
                <Bar
                  dataKey="value"
                  fill={c.series}
                  maxBarSize={40}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v: number) => (v > 0 ? formatCompactCurrency(v) : "")}
                    className="fill-slate-600 dark:fill-slate-300"
                    style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon="📈"
            title="No monthly data yet"
            description="Once you have expenses over time, your monthly trend shows up here."
          />
        )}
      </ChartCard>
    </div>
  );
}
