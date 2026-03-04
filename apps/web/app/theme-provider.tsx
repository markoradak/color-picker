"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

const mq =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function subscribe(cb: () => void) {
  mq?.addEventListener("change", cb);
  return () => mq?.removeEventListener("change", cb);
}

function getSnapshot(): Theme {
  return mq?.matches ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [override, setOverride] = useState<Theme | null>(null);

  // Reset override when system theme changes
  useEffect(() => {
    setOverride(null);
  }, [systemTheme]);

  const theme = override ?? systemTheme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setOverride(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
