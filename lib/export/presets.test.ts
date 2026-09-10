import { describe, expect, it } from "vitest";
import { matchPreset, presetRange } from "./presets";

const NOW = new Date(2026, 8, 10, 12); // 10 Sep 2026, local

describe("presetRange", () => {
  it("returns an open window for 'all' and 'custom'", () => {
    expect(presetRange("all", NOW)).toEqual({ start: "", end: "" });
    expect(presetRange("custom", NOW)).toEqual({ start: "", end: "" });
  });

  it("'month' spans the first of the month through today", () => {
    expect(presetRange("month", NOW)).toEqual({
      start: "2026-09-01",
      end: "2026-09-10",
    });
  });

  it("'last30' spans 30 inclusive days ending today", () => {
    expect(presetRange("last30", NOW)).toEqual({
      start: "2026-08-12",
      end: "2026-09-10",
    });
  });

  it("'ytd' starts on Jan 1", () => {
    expect(presetRange("ytd", NOW)).toEqual({
      start: "2026-01-01",
      end: "2026-09-10",
    });
  });
});

describe("matchPreset", () => {
  it("recognises each preset's own range", () => {
    for (const id of ["all", "month", "last30", "ytd"] as const) {
      expect(matchPreset(presetRange(id, NOW), NOW)).toBe(id);
    }
  });

  it("falls back to 'custom' for an unrecognised range", () => {
    expect(matchPreset({ start: "2026-02-01", end: "2026-02-14" }, NOW)).toBe(
      "custom",
    );
  });

  it("treats a half-open range as custom", () => {
    expect(matchPreset({ start: "2026-01-01", end: "" }, NOW)).toBe("custom");
  });
});
