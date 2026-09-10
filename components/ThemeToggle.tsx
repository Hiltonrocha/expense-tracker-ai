"use client";

import { useTheme } from "./providers/ThemeProvider";
import { Button } from "./ui/Button";

export function ThemeToggle() {
  const { theme, toggleTheme, ready } = useTheme();
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="w-9 px-0"
    >
      <span aria-hidden>{ready ? (theme === "dark" ? "☀️" : "🌙") : "🌓"}</span>
    </Button>
  );
}
