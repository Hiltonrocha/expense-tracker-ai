# Expense Tracker

A modern, responsive personal expense tracker built with **Next.js 14 (App Router)**,
**TypeScript**, and **Tailwind CSS**. Add expenses, filter and search them, see spending
analytics, and export to CSV. All data is stored locally in the browser via
`localStorage` — no backend, no account.

---

## Features

| Area | What you get |
|------|--------------|
| **Add / edit / delete** | Modal form for creating and editing; delete asks for confirmation |
| **Validation** | Live, per-field: amount > 0 with ≤ 2 decimals, non-future date, required description (≤ 200 chars), required category |
| **Expense list** | Responsive table (desktop) / stacked cards (mobile), newest first, running total of the visible rows |
| **Filters** | Combine (AND): free-text description search, category, and a from/to date range. "Clear filters" resets |
| **Dashboard** | Total spending, spend this month, daily average, top category, plus two charts |
| **Charts** | "Spending by category" horizontal bars and "Monthly spending" (last 6 months) columns, via Recharts, colour-and-theme aware |
| **CSV export** | Exports the **currently filtered** rows, RFC-4180 quoted, `expenses-YYYY-MM-DD.csv` |
| **Dark mode** | System-aware with a manual toggle in the nav; preference persisted, no flash on load |
| **UX polish** | Toast notifications, loading skeletons, empty states, "Load sample data" seed, storage-failure warning |

---

## Getting started

Requirements: **Node 18.17+** (Node 20+ recommended) and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Other scripts

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build |
| `npm start` | Serve the production build (after `npm run build`) |
| `npm test` | Run the unit-test suite (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint (`next lint`) |

---

## How to test every feature by hand

Start the app (`npm run dev`) and walk through the following. On first load you'll
see an empty dashboard.

1. **Seed data** — click **Load sample data**. 18 realistic expenses spanning ~3
   months appear; a toast confirms it. The dashboard now shows summary cards and
   both charts.
2. **Add an expense** — click **Add expense** (top-right on either page).
   - Leave the amount blank / type `0` / type `1.999` and blur → inline error under
     the field; the submit button stays disabled.
   - Enter a **future date** → "Date cannot be in the future."
   - Enter amount `8.50`, keep today's date, category *Food*, description
     `Afternoon espresso`, submit → toast "Expense added", row appears at the top
     of the list.
3. **Edit** — go to **Expenses**, hover a row, click **Edit**. The modal opens
   pre-filled. Change the amount, **Save changes** → toast "Expense updated", the
   row reflects the new value.
4. **Delete** — hover a row, click **Delete** → confirmation dialog → **Delete** →
   toast "Expense deleted", the row disappears.
5. **Filter & search** (Expenses page):
   - Type `coffee` in **Search** → list narrows (case-insensitive).
   - Pick a **Category** → combines with the search (AND).
   - Set **From** / **To** dates → range is inclusive. "Showing N of M" and the
     footer total update live. **Clear filters** resets everything.
6. **Export CSV** — with a filter active, click **Export CSV** → a
   `expenses-<today>.csv` downloads containing only the filtered rows, plus a
   toast. Open it in a spreadsheet to confirm the header and quoting.
7. **Dark mode** — click the 🌙 / ☀️ button in the nav. The whole UI (including
   charts) switches. Reload → the choice sticks with no flash.
8. **Responsive** — narrow the window to phone width. The nav stays usable, the
   summary grid collapses to one column, and the expense table becomes stacked
   cards.
9. **Persistence** — reload the page. Everything you added/edited is still there
   (it's in `localStorage` under `expense-tracker-ai/expenses/v1`).
10. **Reset** — Expenses page → **Delete all expenses** (bottom) → confirm, to get
    back to the empty state.

---

## Project structure

```
app/
  layout.tsx            Root layout: providers, nav, no-flash theme script
  page.tsx              Dashboard (summary cards, charts, recent expenses)
  expenses/page.tsx     Full list + filters + export + bulk delete
  globals.css           Tailwind layers + base theme

lib/                    Framework-free, unit-tested logic
  types.ts              Expense / Category / filter types + constants
  categories.ts         Per-category colour + badge metadata (data-viz palette)
  format.ts             Currency + date formatting, ISO-date parsing (Intl)
  validation.ts         Pure form-draft validation
  filters.ts            applyFilters (AND semantics) + isFilterActive
  analytics.ts          summarize, totalsByCategory, monthlyTotals
  csv.ts                RFC-4180 serialisation + browser download
  storage.ts            localStorage read/write with schema validation
  seed.ts               Sample-data generator
  *.test.ts             Vitest suites (37 tests)

hooks/
  useExpenses.ts        CRUD state + hydrate/persist + storage-error flag
  useExpenseDialogs.tsx Wires the add/edit form + delete confirm to the store

components/
  providers/            ThemeProvider, ToastProvider, ExpensesProvider
  ui/                   Button, Card, Modal, Field, ConfirmDialog, EmptyState, cn
  Navbar, ThemeToggle, PageHeader, Skeleton
  ExpenseForm, ExpenseList, ExpenseFilters, SummaryCards, SpendingCharts
  CategoryBadge, EmptyExpensesState, StorageWarning
```

### Design notes

- **State**: a single `useExpenses` instance lives in `ExpensesProvider` at the
  layout level, so both routes share one in-memory copy and navigation doesn't
  re-hydrate. Writes are flushed to `localStorage` on every change; the first
  (hydration) commit is skipped so stored data is never overwritten by the empty
  initial state.
- **Charts**: single-hue where a series is one measure; the category chart keeps
  the fixed per-category colours but always shows the category name on the axis and
  the value at the bar tip, so colour is never the only channel. Palette is the
  validated categorical set from the data-viz guidance (checked in both light and
  dark).
- **Currency / dates**: `Intl.NumberFormat` (USD) and `Intl.DateTimeFormat`.
  Dates are stored as `YYYY-MM-DD` and parsed at local noon to avoid timezone
  roll-over.

---

## Tech

Next.js 14 · React 18 · TypeScript · Tailwind CSS 3 · Recharts 2 · Vitest.

Currency is USD throughout (single-currency by design for this demo).
