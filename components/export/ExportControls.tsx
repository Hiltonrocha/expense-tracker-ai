"use client";

import { CategoryBadge } from "@/components/CategoryBadge";
import { TextField } from "@/components/ui/Field";
import { cn } from "@/components/ui/cn";
import { CATEGORIES, type Category } from "@/lib/types";
import { todayISO } from "@/lib/format";
import {
  EXPORT_FORMATS,
  FORMAT_META,
  RANGE_PRESETS,
  type DateRange,
  type ExportFormat,
  type RangePresetId,
} from "@/lib/export";
import type { ExportController } from "@/hooks/useExportController";

const FORMAT_ICON: Record<ExportFormat, string> = {
  csv: "▦",
  json: "{ }",
  pdf: "▤",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </h3>
  );
}

function FormatPicker({
  value,
  onChange,
  disabled,
}: {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">Export format</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {EXPORT_FORMATS.map((format) => {
          const meta = FORMAT_META[format];
          const active = value === format;
          return (
            <button
              key={format}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(format)}
              className={cn(
                "focus-ring flex flex-col gap-1 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:border-brand-400 dark:bg-brand-500/10"
                  : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {FORMAT_ICON[format]}
                </span>
                <span className="text-sm font-semibold">{meta.label}</span>
              </span>
              <span className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                {meta.blurb}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function RangeControl({
  range,
  activePreset,
  issue,
  onPreset,
  onRange,
  disabled,
}: {
  range: DateRange;
  activePreset: RangePresetId;
  issue: string | null;
  onPreset: (id: RangePresetId) => void;
  onRange: (range: DateRange) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {RANGE_PRESETS.map((preset) => {
          const active = activePreset === preset.id;
          const isCustom = preset.id === "custom";
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled || (isCustom && !active)}
              onClick={() => onPreset(preset.id)}
              className={cn(
                "focus-ring rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-brand-500 bg-brand-600 text-white"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Start date"
          type="date"
          value={range.start}
          max={range.end || todayISO()}
          disabled={disabled}
          onChange={(e) => onRange({ ...range, start: e.target.value })}
        />
        <TextField
          label="End date"
          type="date"
          value={range.end}
          min={range.start || undefined}
          max={todayISO()}
          disabled={disabled}
          error={issue ?? undefined}
          onChange={(e) => onRange({ ...range, end: e.target.value })}
        />
      </div>
    </div>
  );
}

function CategoryControl({
  selected,
  onToggle,
  onSetAll,
  disabled,
}: {
  selected: Category[];
  onToggle: (category: Category) => void;
  onSetAll: (categories: Category[]) => void;
  disabled: boolean;
}) {
  const allSelected = selected.length === CATEGORIES.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {selected.length}
          </span>{" "}
          of {CATEGORIES.length} included
        </p>
        <button
          type="button"
          disabled={disabled || allSelected}
          onClick={() => onSetAll([...CATEGORIES])}
          className="focus-ring rounded text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-40 dark:text-brand-400"
        >
          Select all
        </button>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {CATEGORIES.map((category) => {
          const checked = selected.includes(category);
          return (
            <label
              key={category}
              className={cn(
                "focus-within:ring-2 focus-within:ring-brand-500 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition",
                checked
                  ? "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
                  : "border-slate-200 opacity-60 dark:border-slate-800",
                disabled && "cursor-not-allowed",
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(category)}
              />
              <CategoryBadge category={category} />
            </label>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        With every category checked, no category filter is applied.
      </p>
    </div>
  );
}

export function ExportControls({ controller }: { controller: ExportController }) {
  const busy = controller.phase === "exporting";

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <SectionTitle>Format</SectionTitle>
        <FormatPicker
          value={controller.format}
          onChange={controller.setFormat}
          disabled={busy}
        />
      </section>

      <section className="space-y-2">
        <SectionTitle>Date range</SectionTitle>
        <RangeControl
          range={controller.range}
          activePreset={controller.activePreset}
          issue={controller.rangeIssue?.message ?? null}
          onPreset={controller.applyPreset}
          onRange={controller.setRange}
          disabled={busy}
        />
      </section>

      <section className="space-y-2">
        <SectionTitle>Categories</SectionTitle>
        <CategoryControl
          selected={controller.categories}
          onToggle={controller.toggleCategory}
          onSetAll={controller.setCategories}
          disabled={busy}
        />
      </section>

      <section className="space-y-2">
        <SectionTitle>File name</SectionTitle>
        <TextField
          label="File name"
          value={controller.filenameBase}
          disabled={busy}
          onChange={(e) => controller.setFilenameBase(e.target.value)}
          hint={
            <>
              Saves as{" "}
              <span className="font-mono text-slate-600 dark:text-slate-300">
                {controller.resolvedFilename}
              </span>
            </>
          }
        />
      </section>
    </div>
  );
}
