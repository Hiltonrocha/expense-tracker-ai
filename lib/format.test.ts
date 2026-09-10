import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatMonth,
  parseISODate,
  toISODate,
} from "./format";

describe("formatCurrency", () => {
  it("formats with a $ sign, grouping and 2 decimals", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(7)).toBe("$7.00");
  });

  it("falls back to $0.00 for non-finite input", () => {
    expect(formatCurrency(Number.NaN)).toBe("$0.00");
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("$0.00");
  });
});

describe("formatCompactCurrency", () => {
  it("compacts large numbers", () => {
    expect(formatCompactCurrency(1_234_567)).toBe("$1.2M");
    expect(formatCompactCurrency(2500)).toBe("$2.5K");
  });
});

describe("parseISODate", () => {
  it("parses a valid date at local noon", () => {
    const d = parseISODate("2026-09-10");
    expect(d).not.toBeNull();
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(8);
    expect(d?.getDate()).toBe(10);
    expect(d?.getHours()).toBe(12);
  });

  it("rejects malformed or impossible dates", () => {
    expect(parseISODate("2026-9-10")).toBeNull();
    expect(parseISODate("2026-13-01")).toBeNull();
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(parseISODate("not-a-date")).toBeNull();
    expect(parseISODate("")).toBeNull();
  });
});

describe("toISODate", () => {
  it("uses local calendar fields", () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });

  it("round-trips with parseISODate", () => {
    const iso = "2026-07-04";
    expect(toISODate(parseISODate(iso)!)).toBe(iso);
  });
});

describe("formatDate", () => {
  it("renders a friendly date", () => {
    expect(formatDate("2026-09-10")).toBe("Sep 10, 2026");
  });

  it("returns the input unchanged when unparseable", () => {
    expect(formatDate("garbage")).toBe("garbage");
  });
});

describe("formatMonth", () => {
  it("renders month + year", () => {
    expect(formatMonth("2026-09")).toBe("Sep 2026");
  });
});
