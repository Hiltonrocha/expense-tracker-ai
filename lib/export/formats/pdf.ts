import { formatCurrency, formatDate } from "@/lib/format";
import type { ExportContext, Expense } from "../types";

const BRAND: [number, number, number] = [42, 120, 214]; // brand-600
const INK: [number, number, number] = [15, 23, 42]; // slate-900
const MUTED: [number, number, number] = [100, 116, 139]; // slate-500

function rangeLabel(context: ExportContext): string {
  const { start, end } = context.range;
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return `From ${formatDate(start)}`;
  if (end) return `Through ${formatDate(end)}`;
  return "All dates";
}

function categoryLabel(context: ExportContext): string {
  return context.allCategories
    ? "All categories"
    : context.categories.join(", ");
}

/**
 * Render the expenses as a formatted one- or multi-page PDF report and return it
 * as a Blob. jsPDF and its autotable plugin are heavy and browser-only, so they
 * are loaded on demand the first time a PDF export runs.
 */
export async function buildPdf(
  rows: Expense[],
  context: ExportContext,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable =
    (autoTableModule.default as typeof autoTableModule.autoTable) ??
    autoTableModule.autoTable;

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text("Expense Report", marginX, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${context.generatedAt.toLocaleString("en-US")}`,
    marginX,
    70,
  );

  const metaLines = [
    `Date range:  ${rangeLabel(context)}`,
    `Categories:  ${categoryLabel(context)}`,
    `Records:  ${rows.length}`,
    `Total:  ${formatCurrency(total)}`,
  ];
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  metaLines.forEach((line, i) => doc.text(line, marginX, 96 + i * 15));

  autoTable(doc, {
    startY: 96 + metaLines.length * 15 + 12,
    head: [["Date", "Category", "Amount", "Description"]],
    body: rows.map((r) => [
      formatDate(r.date),
      r.category,
      formatCurrency(r.amount),
      r.description,
    ]),
    foot: [["", "", formatCurrency(total), `${rows.length} records`]],
    styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [241, 245, 249], textColor: INK, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { cellWidth: 90 },
      2: { cellWidth: 70, halign: "right" },
      3: { cellWidth: "auto" },
    },
    margin: { left: marginX, right: marginX },
    didDrawPage: (data: { pageNumber: number }) => {
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(
        `Page ${data.pageNumber}`,
        pageWidth - marginX,
        doc.internal.pageSize.getHeight() - 20,
        { align: "right" },
      );
    },
  });

  return doc.output("blob");
}
