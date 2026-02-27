import { PlaygroundClient } from "./playground-client";

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Playground
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Configure the color picker interactively and copy the generated code.
        </p>
      </div>
      <PlaygroundClient />
    </main>
  );
}
