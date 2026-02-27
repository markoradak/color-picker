"use client";

import { CopyButton } from "./copy-button";

export function CodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="relative">
      <pre
        data-language={language}
        className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed dark:border-neutral-700 dark:bg-neutral-900"
      >
        <code className="font-mono text-neutral-800 dark:text-neutral-200">
          {code}
        </code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}
