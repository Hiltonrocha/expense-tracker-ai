import { describe, expect, it } from "vitest";
import {
  sanitizeFilenameBase,
  suggestedFilenameBase,
  withExtension,
} from "./filename";

describe("sanitizeFilenameBase", () => {
  it("keeps safe characters and turns spaces into dashes", () => {
    expect(sanitizeFilenameBase("Q1 expenses report")).toBe("Q1-expenses-report");
  });

  it("strips path separators and unsafe punctuation", () => {
    expect(sanitizeFilenameBase("../../etc/passwd")).toBe("etcpasswd");
    expect(sanitizeFilenameBase('a:b*c?"d')).toBe("abcd");
  });

  it("trims leading and trailing separators", () => {
    expect(sanitizeFilenameBase("  --report--  ")).toBe("report");
  });

  it("falls back when nothing usable remains", () => {
    expect(sanitizeFilenameBase("***")).toBe("expenses");
    expect(sanitizeFilenameBase("   ", "backup")).toBe("backup");
  });

  it("caps the length", () => {
    expect(sanitizeFilenameBase("x".repeat(200)).length).toBe(80);
  });
});

describe("suggestedFilenameBase", () => {
  const now = new Date("2026-09-10T12:00:00Z");

  it("uses today's date for an open range", () => {
    expect(suggestedFilenameBase({ start: "", end: "" }, now)).toBe(
      "expenses_2026-09-10",
    );
  });

  it("names both bounds for a closed range", () => {
    expect(
      suggestedFilenameBase({ start: "2026-01-01", end: "2026-03-31" }, now),
    ).toBe("expenses_2026-01-01_to_2026-03-31");
  });

  it("collapses a single-day range", () => {
    expect(
      suggestedFilenameBase({ start: "2026-02-02", end: "2026-02-02" }, now),
    ).toBe("expenses_2026-02-02");
  });

  it("handles half-open ranges", () => {
    expect(suggestedFilenameBase({ start: "2026-01-01", end: "" }, now)).toBe(
      "expenses_from_2026-01-01",
    );
    expect(suggestedFilenameBase({ start: "", end: "2026-01-01" }, now)).toBe(
      "expenses_through_2026-01-01",
    );
  });
});

describe("withExtension", () => {
  it("appends the format extension", () => {
    expect(withExtension("expenses", "csv")).toBe("expenses.csv");
    expect(withExtension("expenses", "json")).toBe("expenses.json");
    expect(withExtension("report", "pdf")).toBe("report.pdf");
  });

  it("does not double the extension", () => {
    expect(withExtension("expenses.csv", "csv")).toBe("expenses.csv");
    expect(withExtension("expenses.CSV", "csv")).toBe("expenses.csv");
  });
});
