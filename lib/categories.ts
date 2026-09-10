import type { Category } from "./types";

export interface CategoryMeta {
  /** Swatch colour for light mode (validated data-viz categorical palette). */
  light: string;
  /** Swatch colour for dark mode (same hues, stepped for the dark surface). */
  dark: string;
  /** Tailwind classes for a small pill badge in light + dark. */
  badge: string;
  /** A single emoji used as a lightweight icon. */
  icon: string;
}

/**
 * Fixed metadata per category. Colours come from the data-viz reference
 * categorical palette (slots 1–6) and are used only as swatches beside
 * always-visible text labels, never as the sole channel in a plot.
 */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    light: "#2a78d6",
    dark: "#3987e5",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
    icon: "🍽️",
  },
  Transportation: {
    light: "#eb6834",
    dark: "#d95926",
    badge: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20",
    icon: "🚗",
  },
  Entertainment: {
    light: "#1baf7a",
    dark: "#199e70",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    icon: "🎬",
  },
  Shopping: {
    light: "#eda100",
    dark: "#c98500",
    badge: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    icon: "🛍️",
  },
  Bills: {
    light: "#e87ba4",
    dark: "#d55181",
    badge: "bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-500/10 dark:text-pink-300 dark:ring-pink-400/20",
    icon: "🧾",
  },
  Other: {
    light: "#008300",
    dark: "#008300",
    badge: "bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20",
    icon: "📦",
  },
};

export function categoryColor(category: Category, theme: "light" | "dark"): string {
  return CATEGORY_META[category][theme];
}
