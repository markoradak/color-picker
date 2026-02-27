import { HeroDemo } from "./hero-demo";
import { CodeBlock } from "./code-block";

const INSTALL_CODE = `npm install @markoradak/color-picker`;

const COMPOUND_EXAMPLE = `import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerInput,
  ColorPickerFormatToggle,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerTrigger,
  ColorPickerContent,
} from "@markoradak/color-picker";

function MyColorPicker() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <ColorPickerTrigger />
      <ColorPickerContent>
        <ColorPickerArea />
        <ColorPickerHueSlider />
        <ColorPickerAlphaSlider />
        <div className="flex items-center gap-2">
          <ColorPickerInput />
          <ColorPickerFormatToggle />
          <ColorPickerEyeDropper />
        </div>
        <ColorPickerSwatches
          colors={["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"]}
        />
      </ColorPickerContent>
    </ColorPicker>
  );
}`;

const GRADIENT_EXAMPLE = `import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerGradientEditor,
  toCSS,
} from "@markoradak/color-picker";
import type { ColorPickerValue } from "@markoradak/color-picker";

function MyGradientPicker() {
  const [value, setValue] = useState<ColorPickerValue>({
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#3b82f6", position: 0 },
      { id: "2", color: "#ec4899", position: 100 },
    ],
  });

  return (
    <>
      <ColorPicker value={value} onValueChange={setValue}>
        <ColorPickerArea />
        <ColorPickerHueSlider />
        <ColorPickerGradientEditor />
      </ColorPicker>
      <div style={{ background: toCSS(value) }} />
    </>
  );
}`;

const FEATURES = [
  {
    title: "Compound Components",
    description:
      "Radix-style composable API. Pick only the parts you need and arrange them however you want.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: "Gradient Editor",
    description:
      "Built-in support for linear, radial, conic, and mesh gradients with interactive stop editing.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    title: "Accessible",
    description:
      "Full keyboard navigation, ARIA labels, screen reader support. Built on Radix UI primitives.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="8" r="2" />
        <path d="M8 14l4-2 4 2" />
        <path d="M12 12v6" />
      </svg>
    ),
  },
  {
    title: "Tiny Bundle",
    description:
      "Tree-shakeable ESM + CJS builds. Import only what you use. Zero unnecessary dependencies.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "HEX / RGB / HSL",
    description:
      "Toggle between color formats on the fly. Validates input and formats output automatically.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    title: "EyeDropper API",
    description:
      "Native browser color sampling with graceful degradation when unsupported.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 22l1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="M15 6l3-3a2.12 2.12 0 013 3l-3 3" />
        <path d="M14.5 5.5l4 4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white pb-16 pt-12 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <span className="w-fit rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                  v0.0.1
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl lg:text-5xl">
                  A color picker built for{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    composition
                  </span>
                </h1>
                <p className="max-w-lg text-base text-neutral-600 dark:text-neutral-400 sm:text-lg">
                  Compound components for React. Pick solid colors or edit
                  gradients with a Radix-style composable API. Accessible,
                  tree-shakeable, and framework-ready.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/playground"
                  className="inline-flex items-center rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Open Playground
                </a>
                <a
                  href="https://github.com/markoradak/color-picker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              </div>

              {/* Install */}
              <div className="mt-2">
                <CodeBlock code={INSTALL_CODE} language="bash" />
              </div>
            </div>

            {/* Right: Live demo */}
            <div className="flex justify-center lg:justify-end">
              <HeroDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-neutral-100 py-16 dark:border-neutral-800 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              Everything you need
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              A complete color picking experience with a flexible, composable
              architecture.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="border-b border-neutral-100 py-16 dark:border-neutral-800 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              Compound API
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Compose your picker from individual parts. Use only what you need.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Popover Color Picker
              </h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                The classic pattern: a trigger button that opens a popover with
                the full color picker UI. Built on Radix Popover for accessible
                positioning.
              </p>
              <CodeBlock code={COMPOUND_EXAMPLE} />
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Gradient Editor
              </h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                Pass a gradient value instead of a color string. The picker
                automatically enters gradient mode with stop editing, type
                switching, and angle controls.
              </p>
              <CodeBlock code={GRADIENT_EXAMPLE} />
            </div>
          </div>
        </div>
      </section>

      {/* Gradient showcase */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              Gradient Types
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Four gradient modes out of the box, all with interactive stop
              editing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div
                className="h-40"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              />
              <div className="bg-white p-4 dark:bg-neutral-900">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Linear
                </p>
                <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  linear-gradient(135deg, ...)
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div
                className="h-40"
                style={{
                  background:
                    "radial-gradient(circle at 30% 40%, #f093fb 0%, #f5576c 100%)",
                }}
              />
              <div className="bg-white p-4 dark:bg-neutral-900">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Radial
                </p>
                <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  radial-gradient(circle at ...)
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div
                className="h-40"
                style={{
                  background:
                    "conic-gradient(from 45deg at 50% 50%, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)",
                }}
              />
              <div className="bg-white p-4 dark:bg-neutral-900">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Conic
                </p>
                <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  conic-gradient(from 45deg ...)
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div
                className="h-40"
                style={{
                  background: [
                    "radial-gradient(circle at 20% 30%, #a18cd1 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 20%, #fbc2eb 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 80%, #84fab0 0%, transparent 50%)",
                  ].join(", "),
                }}
              />
              <div className="bg-white p-4 dark:bg-neutral-900">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Mesh
                </p>
                <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  Simulated via layered radials
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8 dark:border-neutral-800">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-neutral-500 dark:text-neutral-400 sm:px-6">
          <p>
            Built by{" "}
            <a
              href="https://github.com/markoradak"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              Marko Radak
            </a>
            . Source on{" "}
            <a
              href="https://github.com/markoradak/color-picker"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}
