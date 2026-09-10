import { toISODate } from "@/lib/format";
import { FORMAT_META, type DateRange, type ExportFormat } from "./types";

const MAX_BASE_LENGTH = 80;

/**
 * Turn arbitrary user text into a safe file-name stem: keep word characters,
 * dashes, dots and spaces; collapse whitespace to single dashes; trim leading
 * and trailing separators; cap the length. Falls back to `fallback` when the
 * result would be empty.
 */
export function sanitizeFilenameBase(
  input: string,
  fallback = "expenses",
): string {
  const cleaned = input
    .normalize("NFKD")
    .replace(/[^\w\-. ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^[-.]+/, "")
    .replace(/[-.]+$/, "")
    .slice(0, MAX_BASE_LENGTH);
  return cleaned.length > 0 ? cleaned : fallback;
}

/** A sensible default stem based on the active date window. */
export function suggestedFilenameBase(
  range: DateRange,
  now: Date = new Date(),
): string {
  if (range.start && range.end) {
    return range.start === range.end
      ? `expenses_${range.start}`
      : `expenses_${range.start}_to_${range.end}`;
  }
  if (range.start) return `expenses_from_${range.start}`;
  if (range.end) return `expenses_through_${range.end}`;
  return `expenses_${toISODate(now)}`;
}

/** Append the format's extension, avoiding a double extension. */
export function withExtension(base: string, format: ExportFormat): string {
  const ext = FORMAT_META[format].extension;
  const trimmed = base.replace(new RegExp(`\\.${ext}$`, "i"), "");
  return `${trimmed}.${ext}`;
}
