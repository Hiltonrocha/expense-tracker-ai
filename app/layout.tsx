import type { Metadata, Viewport } from "next";
import "./globals.css";
import {
  ThemeProvider,
  themeNoFlashScript,
} from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ExpensesProvider } from "@/components/providers/ExpensesProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description:
    "A clean, modern personal expense tracker — add, filter, analyse and export your spending.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <ExpensesProvider>
              <Navbar />
              <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>
              <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-slate-400 dark:text-slate-600">
                Data is stored locally in your browser. Clearing site data will remove it.
              </footer>
            </ExpensesProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
