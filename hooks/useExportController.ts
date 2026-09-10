"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CATEGORIES, type Category, type Expense } from "@/lib/types";
import {
  createExport,
  downloadArtifact,
  matchPreset,
  presetRange,
  sanitizeFilenameBase,
  selectForExport,
  suggestedFilenameBase,
  summarizeSelection,
  withExtension,
  type DateRange,
  type ExportFormat,
  type ExportOptions,
  type RangePresetId,
  type SelectionStats,
} from "@/lib/export";

/** Where the export flow currently is. Drives the footer button + banners. */
export type ExportPhase = "configuring" | "exporting" | "done" | "error";

export interface ExportControllerState {
  format: ExportFormat;
  range: DateRange;
  categories: Category[];
  filenameBase: string;
}

export interface RangeIssue {
  message: string;
}

export interface ExportController {
  /* current configuration */
  format: ExportFormat;
  range: DateRange;
  categories: Category[];
  filenameBase: string;
  activePreset: RangePresetId;

  /* derived */
  rows: Expense[];
  stats: SelectionStats;
  rangeIssue: RangeIssue | null;
  resolvedFilename: string;
  canExport: boolean;

  /* lifecycle */
  phase: ExportPhase;
  lastResult: { filename: string; count: number } | null;
  errorMessage: string | null;

  /* actions */
  setFormat: (format: ExportFormat) => void;
  setRange: (range: DateRange) => void;
  applyPreset: (id: RangePresetId) => void;
  toggleCategory: (category: Category) => void;
  setCategories: (categories: Category[]) => void;
  setFilenameBase: (value: string) => void;
  runExport: () => Promise<void>;
  reset: () => void;
}

function defaultState(): ExportControllerState {
  const range = { start: "", end: "" };
  return {
    format: "csv",
    range,
    // Every category included by default. An all-six selection is treated as
    // "no category filter" downstream (see buildExportContext).
    categories: [...CATEGORIES],
    filenameBase: suggestedFilenameBase(range),
  };
}

export function useExportController(
  expenses: Expense[],
  onNotify?: (message: string, tone?: "success" | "error" | "info") => void,
): ExportController {
  const [state, setState] = useState<ExportControllerState>(defaultState);
  const [phase, setPhase] = useState<ExportPhase>("configuring");
  const [lastResult, setLastResult] = useState<
    { filename: string; count: number } | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Once the user edits the name we stop syncing it to the date range.
  const filenameTouched = useRef(false);

  const patch = useCallback((part: Partial<ExportControllerState>) => {
    setState((prev) => ({ ...prev, ...part }));
    setPhase("configuring");
  }, []);

  const setFormat = useCallback(
    (format: ExportFormat) => patch({ format }),
    [patch],
  );

  const setRange = useCallback(
    (range: DateRange) => {
      setState((prev) => ({
        ...prev,
        range,
        filenameBase: filenameTouched.current
          ? prev.filenameBase
          : suggestedFilenameBase(range),
      }));
      setPhase("configuring");
    },
    [],
  );

  const applyPreset = useCallback(
    (id: RangePresetId) => {
      if (id === "custom") return;
      setRange(presetRange(id));
    },
    [setRange],
  );

  const toggleCategory = useCallback((category: Category) => {
    setState((prev) => {
      const has = prev.categories.includes(category);
      const next = has
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      // Keep the stored order canonical so an all-six set compares cleanly.
      return { ...prev, categories: CATEGORIES.filter((c) => next.includes(c)) };
    });
    setPhase("configuring");
  }, []);

  const setCategories = useCallback(
    (categories: Category[]) => patch({ categories }),
    [patch],
  );

  const setFilenameBase = useCallback((value: string) => {
    filenameTouched.current = true;
    setState((prev) => ({ ...prev, filenameBase: value }));
    setPhase("configuring");
  }, []);

  const rows = useMemo(
    () => selectForExport(expenses, { range: state.range, categories: state.categories }),
    [expenses, state.range, state.categories],
  );

  const stats = useMemo(() => summarizeSelection(rows), [rows]);

  const rangeIssue = useMemo<RangeIssue | null>(() => {
    const { start, end } = state.range;
    if (start && end && start > end) {
      return { message: "The start date is after the end date." };
    }
    return null;
  }, [state.range]);

  const activePreset = useMemo(
    () => matchPreset(state.range),
    [state.range],
  );

  const resolvedFilename = useMemo(
    () => withExtension(sanitizeFilenameBase(state.filenameBase), state.format),
    [state.filenameBase, state.format],
  );

  const canExport =
    phase !== "exporting" && rangeIssue === null && rows.length > 0;

  const runExport = useCallback(async () => {
    if (rangeIssue || rows.length === 0) return;
    setPhase("exporting");
    setErrorMessage(null);
    try {
      const options: ExportOptions = {
        format: state.format,
        range: state.range,
        categories: state.categories,
        filenameBase: state.filenameBase,
      };
      const artifact = await createExport(rows, options);
      downloadArtifact(artifact);
      setLastResult({ filename: artifact.filename, count: rows.length });
      setPhase("done");
      onNotify?.(
        `Exported ${rows.length} ${rows.length === 1 ? "record" : "records"} to ${artifact.filename}`,
        "success",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "The export could not be created.";
      setErrorMessage(message);
      setPhase("error");
      onNotify?.("Export failed. Please try again.", "error");
    }
  }, [rangeIssue, rows, state, onNotify]);

  const reset = useCallback(() => {
    filenameTouched.current = false;
    setState(defaultState());
    setPhase("configuring");
    setLastResult(null);
    setErrorMessage(null);
  }, []);

  return {
    format: state.format,
    range: state.range,
    categories: state.categories,
    filenameBase: state.filenameBase,
    activePreset,
    rows,
    stats,
    rangeIssue,
    resolvedFilename,
    canExport,
    phase,
    lastResult,
    errorMessage,
    setFormat,
    setRange,
    applyPreset,
    toggleCategory,
    setCategories,
    setFilenameBase,
    runExport,
    reset,
  };
}
