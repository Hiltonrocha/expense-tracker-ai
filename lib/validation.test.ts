import { describe, expect, it } from "vitest";
import { validateDraft, isDraftValid } from "./validation";
import { todayISO } from "./format";
import type { ExpenseDraft } from "./types";

const valid: ExpenseDraft = {
  date: "2026-01-15",
  amount: "23.99",
  category: "Food",
  description: "Lunch",
};

describe("validateDraft", () => {
  it("accepts a well-formed draft", () => {
    expect(validateDraft(valid)).toEqual({});
    expect(isDraftValid(valid)).toBe(true);
  });

  it("requires an amount", () => {
    expect(validateDraft({ ...valid, amount: "" }).amount).toBeDefined();
    expect(validateDraft({ ...valid, amount: "   " }).amount).toBeDefined();
  });

  it("rejects non-numeric, zero and negative amounts", () => {
    expect(validateDraft({ ...valid, amount: "abc" }).amount).toBeDefined();
    expect(validateDraft({ ...valid, amount: "0" }).amount).toBeDefined();
    expect(validateDraft({ ...valid, amount: "-5" }).amount).toBeDefined();
  });

  it("rejects more than 2 decimal places", () => {
    expect(validateDraft({ ...valid, amount: "1.999" }).amount).toBeDefined();
  });

  it("rejects absurdly large amounts", () => {
    expect(validateDraft({ ...valid, amount: "2000000" }).amount).toBeDefined();
  });

  it("requires a valid, non-future date", () => {
    expect(validateDraft({ ...valid, date: "" }).date).toBeDefined();
    expect(validateDraft({ ...valid, date: "2026-02-30" }).date).toBeDefined();
    expect(validateDraft({ ...valid, date: "2999-01-01" }).date).toBeDefined();
    expect(validateDraft({ ...valid, date: todayISO() }).date).toBeUndefined();
  });

  it("requires a non-empty, bounded description", () => {
    expect(validateDraft({ ...valid, description: "  " }).description).toBeDefined();
    expect(
      validateDraft({ ...valid, description: "x".repeat(201) }).description,
    ).toBeDefined();
  });

  it("rejects an unknown category", () => {
    expect(
      validateDraft({ ...valid, category: "Rent" as ExpenseDraft["category"] })
        .category,
    ).toBeDefined();
  });
});
