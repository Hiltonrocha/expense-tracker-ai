"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { useExpensesContext } from "@/components/providers/ExpensesProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useExportController } from "@/hooks/useExportController";
import { FORMAT_META } from "@/lib/export";
import { ExportControls } from "./ExportControls";
import { ExportPreviewTable, ExportSummaryBar } from "./ExportPreview";

interface ExportDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDrawer({ open, onClose }: ExportDrawerProps) {
  const { expenses } = useExpensesContext();
  const { notify } = useToast();
  const controller = useExportController(expenses, notify);
  const panelRef = useRef<HTMLDivElement>(null);
  const { reset } = controller;

  // Lock body scroll, wire ESC, restore focus — mirrors the app's Modal.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current
      ?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  // Start every fresh open from clean defaults.
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  if (!open || typeof document === "undefined") return null;

  const busy = controller.phase === "exporting";
  const formatLabel = FORMAT_META[controller.format].label;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onMouseDown={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-drawer-title"
        className="relative flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl animate-drawer-in dark:border-slate-800 dark:bg-slate-900"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 id="export-drawer-title" className="text-base font-semibold">
              Export expenses
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Choose a format, narrow the data, preview it, then download.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close export panel"
            className="-mr-2 -mt-1"
          >
            ✕
          </Button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <ExportControls controller={controller} />

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Preview
            </h3>
            <ExportSummaryBar stats={controller.stats} />
            <ExportPreviewTable rows={controller.rows} />
          </section>

          {controller.phase === "done" && controller.lastResult && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              Downloaded{" "}
              <span className="font-mono">{controller.lastResult.filename}</span>{" "}
              with {controller.lastResult.count}{" "}
              {controller.lastResult.count === 1 ? "record" : "records"}.
            </div>
          )}
          {controller.phase === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {controller.errorMessage ?? "The export could not be created."}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {controller.rangeIssue ? (
              <span className="font-medium text-red-600 dark:text-red-400">
                {controller.rangeIssue.message}
              </span>
            ) : (
              <>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {controller.stats.count}
                </span>{" "}
                {controller.stats.count === 1 ? "record" : "records"} ready
              </>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={controller.runExport}
              loading={busy}
              disabled={!controller.canExport}
            >
              {busy ? "Preparing…" : `Export ${formatLabel}`}
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
