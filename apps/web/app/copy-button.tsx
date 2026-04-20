"use client";

import { useCallback, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute right-2 top-2 rounded-md border border-zinc-300 bg-white/90 px-2 py-1 text-xs font-medium text-zinc-600 outline-none backdrop-blur-sm transition-[color,box-shadow] hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-ring-offset dark:border-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-400 dark:hover:bg-zinc-700"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
