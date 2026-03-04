"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./theme-provider";

export function Nav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const order: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]!);
  };

  const themeLabel =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e5e5e5] bg-white/80 backdrop-blur-md dark:border-[#2a2a2a] dark:bg-[#0f0f0f]/80">
      <div className="mx-auto flex h-14 max-w-[1000px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold text-[#222] transition-colors hover:text-accent dark:text-white dark:hover:text-accent"
          >
            @markoradak/color-picker
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`text-sm transition-colors ${
                pathname === "/"
                  ? "text-[#222] dark:text-white"
                  : "text-[#666] hover:text-accent"
              }`}
            >
              Home
            </Link>
            <Link
              href="/playground"
              className={`text-sm transition-colors ${
                pathname === "/playground"
                  ? "text-[#222] dark:text-white"
                  : "text-[#666] hover:text-accent"
              }`}
            >
              Playground
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/markoradak/color-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#666] transition-colors hover:text-accent"
            aria-label="GitHub repository"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={cycleTheme}
            className="flex items-center gap-1.5 rounded-md border border-[#e5e5e5] px-2.5 py-1.5 text-xs text-[#666] transition-colors hover:text-accent dark:border-[#2a2a2a]"
            aria-label={`Current theme: ${themeLabel}. Click to change.`}
          >
            {theme === "light" && (
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
            {theme === "dark" && (
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
            {theme === "system" && (
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            )}
            {themeLabel}
          </button>
        </div>
      </div>
    </nav>
  );
}
