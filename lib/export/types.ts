import type { Category, Expense } from "@/lib/types";

/** The file formats the export system can produce. */
export type ExportFormat = "csv" | "json" | "pdf";

export const EXPORT_FORMATS: ExportFormat[] = ["csv", "json", "pdf"];

export interface ExportFormatMeta {
  id: ExportFormat;
  label: string;
  extension: string;
  mimeType: string;
  /** One-line pitch shown in the format picker. */
  blurb: string;
}

export const FORMAT_META: Record<ExportFormat, ExportFormatMeta> = {
  csv: {
    id: "csv",
    label: "CSV",
    extension: "csv",
    mimeType: "text/csv;charset=utf-8;",
    blurb: "Spreadsheet-ready rows for Excel, Numbers or Google Sheets.",
  },
  json: {
    id: "json",
    label: "JSON",
    extension: "json",
    mimeType: "application/json;charset=utf-8;",
    blurb: "Structured records with metadata for scripts and backups.",
  },
  pdf: {
    id: "pdf",
    label: "PDF",
    extension: "pdf",
    mimeType: "application/pdf",
    blurb: "A formatted report you can print, archive or hand to finance.",
  },
};

/** Inclusive date window, `YYYY-MM-DD` strings; "" means unbounded on that side. */
export interface DateRange {
  start: string;
  end: string;
}

export const OPEN_RANGE: DateRange = { start: "", end: "" };

/** Everything that narrows which expenses land in the file. */
export interface ExportSelection {
  range: DateRange;
  /** Categories to include. Empty array is treated as "every category". */
  categories: Category[];
}

/** A complete, validated export request. */
export interface ExportOptions extends ExportSelection {
  format: ExportFormat;
  /** Base name with no extension and no path separators. */
  filenameBase: string;
}

/** Context threaded into the JSON and PDF writers for their headers. */
export interface ExportContext {
  generatedAt: Date;
  range: DateRange;
  /** Resolved category list (never empty — expanded to all six when unfiltered). */
  categories: Category[];
  /** True when no category filter was applied. */
  allCategories: boolean;
}

/** The finished artifact, ready to hand to the browser. */
export interface ExportArtifact {
  blob: Blob;
  filename: string;
}

/** Roll-up of the current selection, shown in the summary bar. */
export interface SelectionStats {
  count: number;
  total: number;
  earliest: string | null;
  latest: string | null;
  perCategory: Array<{ category: Category; count: number; total: number }>;
}

export type { Category, Expense };
