import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";
import type { Theme } from "./ThemeContext";

const STORAGE_KEY = "nhp-theme";

function getInitialTheme(): Theme {
  // 1. Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Paper is the initial edition; preserve an explicitly saved preference.
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#18231d" : "#f8faf7");
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = getInitialTheme();
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
