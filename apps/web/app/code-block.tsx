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
        className="overflow-x-auto rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-sm leading-relaxed dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
      >
        <code className="text-[#222] dark:text-[#e5e5e5]">
          {code}
        </code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}
