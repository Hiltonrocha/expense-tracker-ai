import { describe, expect, it } from "vitest";
import { buildExportContext, createExport } from "./createExport";
import type { ExportOptions, Expense } from "./types";

function make(partial: Partial<Expense>): Expense {
  return {
    id: "e1",
    date: "2026-01-10",
    amount: 12.5,
    category: "Food",
    description: "Lunch",
    createdAt: "2026-01-10T12:00:00.000Z",
    ...partial,
  };
}

const baseOptions: ExportOptions = {
  format: "csv",
  range: { start: "", end: "" },
  categories: [],
  filenameBase: "my export",
};

describe("buildExportContext", () => {
  it("marks allCategories and expands the category list when unfiltered", () => {
    const ctx = buildExportContext(baseOptions, new Date("2026-09-10T00:00:00Z"));
    expect(ctx.allCategories).toBe(true);
    expect(ctx.categories.length).toBe(6);
  });

  it("keeps an explicit category filter", () => {
    const ctx = buildExportContext({ ...baseOptions, categories: ["Bills"] });
    expect(ctx.allCategories).toBe(false);
    expect(ctx.categories).toEqual(["Bills"]);
  });

  it("treats an explicit all-six selection as no filter", () => {
    const ctx = buildExportContext({
      ...baseOptions,
      categories: [
        "Food",
        "Transportation",
        "Entertainment",
        "Shopping",
        "Bills",
        "Other",
      ],
    });
    expect(ctx.allCategories).toBe(true);
  });
});

describe("createExport", () => {
  const rows = [make({}), make({ id: "e2", amount: 8, category: "Bills", description: "Water" })];

  it("sanitizes the filename and adds the CSV extension, with a UTF-8 BOM", async () => {
    const artifact = await createExport(rows, baseOptions);
    expect(artifact.filename).toBe("my-export.csv");
    expect(artifact.blob.type).toContain("text/csv");

    // The raw bytes must start with the UTF-8 BOM (EF BB BF); Blob.text()
    // decodes UTF-8 and strips a leading BOM, so check the bytes directly.
    const bytes = new Uint8Array(await artifact.blob.arrayBuffer());
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);

    const text = await artifact.blob.text();
    expect(text).toContain("Date,Category,Amount,Description");
    expect(text).toContain("2026-01-10,Bills,8.00,Water");
  });

  it("emits a JSON artifact with the right extension and MIME type", async () => {
    const artifact = await createExport(rows, { ...baseOptions, format: "json" });
    expect(artifact.filename).toBe("my-export.json");
    expect(artifact.blob.type).toContain("application/json");
    const doc = JSON.parse(await artifact.blob.text());
    expect(doc.summary.count).toBe(2);
    expect(doc.expenses).toHaveLength(2);
  });
});
