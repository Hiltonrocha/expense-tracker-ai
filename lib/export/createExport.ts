import { CATEGORIES } from "@/lib/types";
import { FORMAT_META, type ExportArtifact, type ExportContext, type ExportOptions, type Expense } from "./types";
import { resolveCategories } from "./selection";
import { sanitizeFilenameBase, withExtension } from "./filename";
import { buildCsv } from "./formats/csv";
import { buildJson } from "./formats/json";
import { buildPdf } from "./formats/pdf";

/** UTF-8 BOM (U+FEFF) so Excel opens CSV exports with the right encoding. */
const BOM = String.fromCharCode(0xfeff);

export function buildExportContext(
  options: ExportOptions,
  generatedAt: Date = new Date(),
): ExportContext {
  return {
    generatedAt,
    range: options.range,
    categories: resolveCategories(options.categories),
    // No filter when nothing — or everything — is picked.
    allCategories:
      options.categories.length === 0 ||
      options.categories.length === CATEGORIES.length,
  };
}

/**
 * Produce the downloadable artifact for a set of already-selected rows. PDF
 * generation is async (the renderer is loaded on demand); CSV and JSON resolve
 * immediately but share the async signature for a uniform call site.
 */
export async function createExport(
  rows: Expense[],
  options: ExportOptions,
  generatedAt: Date = new Date(),
): Promise<ExportArtifact> {
  const context = buildExportContext(options, generatedAt);
  const filename = withExtension(
    sanitizeFilenameBase(options.filenameBase),
    options.format,
  );
  const { mimeType } = FORMAT_META[options.format];

  switch (options.format) {
    case "csv":
      return {
        blob: new Blob([BOM, buildCsv(rows)], { type: mimeType }),
        filename,
      };
    case "json":
      return {
        blob: new Blob([buildJson(rows, context)], { type: mimeType }),
        filename,
      };
    case "pdf":
      return { blob: await buildPdf(rows, context), filename };
  }
}
