"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "./copy-button";

type Manager = "npm" | "pnpm" | "yarn" | "bun";

const MANAGERS: Manager[] = ["npm", "pnpm", "yarn", "bun"];

const COMMANDS: Record<Manager, (pkg: string) => string> = {
  npm: (pkg) => `npm install ${pkg}`,
  pnpm: (pkg) => `pnpm add ${pkg}`,
  yarn: (pkg) => `yarn add ${pkg}`,
  bun: (pkg) => `bun add ${pkg}`,
};

const STORAGE_KEY = "cp-pkg-manager";

export function InstallCommand({ pkg }: { pkg: string }) {
  const [manager, setManager] = useState<Manager>("npm");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Manager | null;
      if (saved && MANAGERS.includes(saved)) setManager(saved);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const selectManager = (m: Manager) => {
    setManager(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // localStorage unavailable
    }
  };

  const command = COMMANDS[manager](pkg);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Package manager"
        className="mb-2 flex items-center justify-end gap-0.5"
      >
        {MANAGERS.map((m) => {
          const active = m === manager;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectManager(m)}
              className={
                active
                  ? "cursor-pointer rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-[#222] dark:border-neutral-600 dark:bg-neutral-800 dark:text-[#e5e5e5]"
                  : "cursor-pointer rounded-md border border-transparent px-2.5 py-1 text-xs font-medium text-[#999] transition-colors hover:text-[#222] dark:text-[#666] dark:hover:text-[#e5e5e5]"
              }
            >
              {m}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <pre
          data-language="bash"
          className="overflow-x-auto rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-sm leading-relaxed dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
        >
          <code className="text-[#222] dark:text-[#e5e5e5]">{command}</code>
        </pre>
        <CopyButton text={command} />
      </div>
    </div>
  );
}
