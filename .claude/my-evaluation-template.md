# Best-of-N Evaluation Template — Expense Tracker

Use this instead of the default evaluation checklist whenever multiple
implementations of a feature/fix are generated for this repo and need to be
compared. Score each candidate against every criterion, call out concrete
line references, and end with a ranked recommendation — don't just declare
a winner.

## Context this project cares about

- **Client-only app.** Next.js 14 App Router + TypeScript, no backend, no
  auth, no database. All persistence is `localStorage` (`lib/storage.ts`).
  So: no server-side security concerns (SQLi, auth bypass) — instead watch
  for unsafe `JSON.parse` of stored data, missing quota/`storage` exception
  handling, and XSS via unsanitized rendering of user-entered
  description/category text.
- **Small bundle, no heavy deps.** Recharts is the one exception already
  approved. A candidate that pulls in a new dependency for something
  achievable with existing utilities (`lib/format.ts`, `lib/filters.ts`,
  Tailwind) loses points unless it's clearly justified.
- **Established conventions** — a candidate should fit these, not invent
  parallel patterns:
  - Pure, side-effect-free helpers live in `lib/*.ts` with a co-located
    `*.test.ts`.
  - Shared UI primitives live in `components/ui/*` (`Button`, `Card`,
    `Modal`, `Field`, `ConfirmDialog`, `EmptyState`) — reuse them instead of
    ad hoc markup/styling.
  - Cross-cutting state goes through the providers in
    `components/providers/*` (`ExpensesProvider`, `ThemeProvider`,
    `ToastProvider`) and the `hooks/*` layer, not new context invented
    per-feature.
  - Styling is Tailwind utility classes + `cn()` (`components/ui/cn.ts`),
    not new CSS files or inline `style=`.

## Scoring criteria (weight out of 100)

1. **Correctness on the golden path + edge cases (30)**
   - Matches the feature's acceptance criteria exactly.
   - Handles the edge cases this app actually has: amount with >2 decimals,
     future dates, empty/whitespace description, empty expense list, very
     large CSV export, `localStorage` unavailable or full, filters that
     produce zero results, month boundaries in "last 6 months" charts.
   - No regressions to adjacent features (filters + charts + CSV export are
     all derived from the same expense list — check a change to one didn't
     silently break another).

2. **Fit with existing architecture and conventions (20)**
   - Reuses `lib/` helpers, `components/ui/` primitives, and the provider/
     hook pattern rather than introducing a parallel one.
   - New pure logic goes in `lib/`, is unit-testable, and doesn't leak into
     components.
   - Types are added to/reused from `lib/types.ts` rather than redefined
     locally.

3. **Test coverage (15)**
   - New/changed `lib/*` logic has a co-located `*.test.ts` (this repo's
     norm, per `lib/analytics.test.ts`, `lib/csv.test.ts`,
     `lib/filters.test.ts`, `lib/validation.test.ts`, `lib/format.test.ts`).
   - Tests cover the edge cases above, not just the happy path.
   - `npm test` passes; no skipped/disabled tests introduced to get green.

4. **Accessibility & UX polish (15)**
   - Keyboard-operable (modals trap focus and close on Escape, forms
     submit on Enter).
   - Inline validation errors are associated with their field (not just
     colored text).
   - Loading/empty states use `Skeleton` / `EmptyState` rather than a blank
     screen or layout shift.
   - Dark mode: no hardcoded colors that break in the dark theme — check
     against `ThemeToggle`/`ThemeProvider` conventions.

5. **Type safety & lint cleanliness (10)**
   - No `any`, no unchecked `as` casts to route around a type error.
   - `npm run lint` and `tsc` (via `next build`) are clean.

6. **Simplicity / no over-engineering (10)**
   - No abstraction, config flag, or generalization beyond what the task
     needed (e.g., a plugin system for a single CSV export tweak is a red
     flag).
   - Diff size is proportionate to the task.

## Auto-reject / hard flags (report even if not asked)

- Introduces a backend call, external API, or auth flow — this app is
  explicitly local-only.
- Stores or logs expense data outside `localStorage` (e.g., `console.log`
  of full expense objects, sending data to an analytics endpoint).
- Renders user-entered text via `dangerouslySetInnerHTML` or otherwise
  unescaped.
- Breaks CSV RFC-4180 quoting (existing behavior documented in
  `lib/csv.ts`/README) without a stated reason.
- Adds a new dependency for something the standard library, Tailwind, or
  an existing `lib/` helper already covers.

## Output format

For each candidate:
- One-line verdict + score per criterion (e.g., `Correctness: 27/30 — misses future-date edge case in bulk edit`).
- Total score.
- Top 1-2 concrete issues with file:line references.

Then: a ranked list of all candidates with a one-sentence justification for
the top pick, and any cherry-pickable idea from a non-winning candidate
worth folding in.
