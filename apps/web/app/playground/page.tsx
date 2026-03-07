import type { Metadata } from "next";
import { ThemeToggle } from "../theme-toggle";
import { PlaygroundClient } from "./playground-client";

export const metadata: Metadata = {
  title: "Playground - @markoradak/color-picker",
  description:
    "Configure the color picker interactively and copy the generated code.",
};

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-[1000px] px-6 py-16 md:px-10 sm:py-24">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Playground</h1>
          <p className="mt-2 text-sm text-[#666]">
            Configure the color picker interactively and copy the generated
            code.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-sm text-[#666] transition-colors hover:text-accent"
          >
            Home
          </a>
          <ThemeToggle />
        </div>
      </div>
      <PlaygroundClient />
    </main>
  );
}
