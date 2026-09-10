import { toISODate } from "@/lib/format";
import { OPEN_RANGE, type DateRange } from "./types";

export type RangePresetId = "all" | "month" | "last30" | "ytd" | "custom";

export interface RangePreset {
  id: RangePresetId;
  label: string;
}

export const RANGE_PRESETS: RangePreset[] = [
  { id: "all", label: "All time" },
  { id: "month", label: "This month" },
  { id: "last30", label: "Last 30 days" },
  { id: "ytd", label: "Year to date" },
  { id: "custom", label: "Custom" },
];

/** The concrete date window for a preset, evaluated relative to `now`. */
export function presetRange(id: RangePresetId, now: Date = new Date()): DateRange {
  const today = toISODate(now);
  switch (id) {
    case "all":
    case "custom":
      return { ...OPEN_RANGE };
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toISODate(first), end: today };
    }
    case "last30": {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { start: toISODate(from), end: today };
    }
    case "ytd": {
      const jan1 = new Date(now.getFullYear(), 0, 1);
      return { start: toISODate(jan1), end: today };
    }
  }
}

/**
 * Which preset chip should read as active for the given range. Returns "custom"
 * when the range matches no preset (including a half-open range).
 */
export function matchPreset(range: DateRange, now: Date = new Date()): RangePresetId {
  for (const { id } of RANGE_PRESETS) {
    if (id === "custom") continue;
    const candidate = presetRange(id, now);
    if (candidate.start === range.start && candidate.end === range.end) {
      return id;
    }
  }
  return "custom";
}
