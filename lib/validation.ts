import { CATEGORIES, type ExpenseDraft } from "./types";
import { parseISODate, todayISO } from "./format";

export const DESCRIPTION_MAX = 200;
export const AMOUNT_MAX = 1_000_000;

export type FieldErrors = Partial<Record<keyof ExpenseDraft, string>>;

/**
 * Validate a raw form draft. Returns a map of field -> message; an empty map
 * means the draft is submittable. Pure and synchronous so it can drive both
 * live field errors and the submit guard.
 */
export function validateDraft(draft: ExpenseDraft): FieldErrors {
  const errors: FieldErrors = {};

  // amount
  const rawAmount = draft.amount.trim();
  if (!rawAmount) {
    errors.amount = "Enter an amount.";
  } else {
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount)) {
      errors.amount = "Amount must be a number.";
    } else if (amount <= 0) {
      errors.amount = "Amount must be greater than 0.";
    } else if (amount > AMOUNT_MAX) {
      errors.amount = "That amount looks too large.";
    } else if (Math.round(amount * 100) !== amount * 100) {
      errors.amount = "Use at most 2 decimal places.";
    }
  }

  // date
  const date = draft.date.trim();
  if (!date) {
    errors.date = "Pick a date.";
  } else {
    const parsed = parseISODate(date);
    if (!parsed) {
      errors.date = "That date is not valid.";
    } else if (date > todayISO()) {
      errors.date = "Date cannot be in the future.";
    }
  }

  // category
  if (!CATEGORIES.includes(draft.category)) {
    errors.category = "Choose a category.";
  }

  // description
  const description = draft.description.trim();
  if (!description) {
    errors.description = "Add a short description.";
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = `Keep it under ${DESCRIPTION_MAX} characters.`;
  }

  return errors;
}

export function isDraftValid(draft: ExpenseDraft): boolean {
  return Object.keys(validateDraft(draft)).length === 0;
}
