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
      className="absolute right-2 top-2 rounded-md border border-neutral-300 bg-white/90 px-2 py-1 text-xs font-medium text-neutral-600 backdrop-blur-sm transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800/90 dark:text-neutral-400 dark:hover:bg-neutral-700"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
