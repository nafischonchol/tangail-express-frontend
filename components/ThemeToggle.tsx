"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 md:h-[1.1rem] md:w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-300" />
      <Moon className="absolute h-4 w-4 md:h-[1.1rem] md:w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-300" />
    </button>
  );
}
