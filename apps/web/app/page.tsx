export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          @markoradak/color-picker
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          A compound-component React color picker and gradient editor.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500">
          Color picker component will render here once implemented.
        </p>
      </div>

      <div className="flex gap-4">
        <a
          href="/playground"
          className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Open Playground
        </a>
      </div>
    </main>
  );
}
