import { HeroDemo } from "./hero-demo";
import { CodeBlock } from "./code-block";
import { ThemeToggle } from "./theme-toggle";
import { PlaygroundClient } from "./playground/playground-client";

const INSTALL_CODE = `npm install @markoradak/color-picker`;

const COMPOUND_EXAMPLE = `import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerInput,
  ColorPickerEyeDropper,
  ColorPickerModeSelector,
  ColorPickerGradientEditor,
  ColorPickerTrigger,
  ColorPickerContent,
} from "@markoradak/color-picker";

function MyColorPicker() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <ColorPickerTrigger />
      <ColorPickerContent>
        <ColorPickerModeSelector />
        <ColorPickerArea />
        <ColorPickerHueSlider />
        <ColorPickerAlphaSlider />
        <ColorPickerInput />
        <ColorPickerEyeDropper />
      </ColorPickerContent>
    </ColorPicker>
  );
}`;

const GRADIENT_EXAMPLE = `import {
  ColorPicker,
  ColorPickerGradientEditor,
  ColorPickerGradientSwatches,
  ColorPickerModeSelector,
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
    <ColorPicker value={value} onValueChange={setValue}>
      <ColorPickerModeSelector />
      <ColorPickerGradientEditor />
      <ColorPickerGradientSwatches values={[...]} />
      <div style={{ background: toCSS(value) }} />
    </ColorPicker>
  );
}`;

const PRESET_EXAMPLE = `import { ColorPickerInline } from "@markoradak/color-picker/presets";

function QuickPicker() {
  const [color, setColor] = useState("#16db89");

  return (
    <ColorPickerInline
      value={color}
      onValueChange={setColor}
    />
  );
}`;

const TOKENS_EXAMPLE = `import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerInput,
} from "@markoradak/color-picker";

// Pass named tokens — the input shows a badge when the color matches
const tokens = {
  primary: "#3b82f6",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

function MyColorPicker() {
  const [color, setColor] = useState("#3b82f6");

  return (
    // autoTokens auto-detects CSS custom properties (enabled by default).
    // Set autoTokens={false} to disable auto-detection and use only manual tokens.
    <ColorPicker value={color} onValueChange={setColor} tokens={tokens}>
      <ColorPickerArea />
      <ColorPickerHueSlider />
      <ColorPickerInput enableTokenSearch />
    </ColorPicker>
  );
}`;

const FEATURES = [
  {
    title: "Compound Components",
    description:
      "Radix-style composable API. Pick only the parts you need and arrange them however you want.",
  },
  {
    title: "Gradient Editor",
    description:
      "Linear, radial, conic, and mesh gradients with interactive stop editing, angle controls, and type switching.",
  },
  {
    title: "Solid Colors",
    description:
      "Full HEX, RGB, and HSL support with format toggling, validated input, and automatic formatting.",
  },
  {
    title: "Mode Selector",
    description:
      "Built-in toggle between solid and gradient modes. One value type handles both.",
  },
  {
    title: "Eye Dropper",
    description:
      "Native browser color sampling via the EyeDropper API with graceful fallback when unsupported.",
  },
  {
    title: "Color Tokens",
    description:
      "Named color tokens with automatic matching, searchable dropdown, and keyboard navigation. Pass your own tokens or let autoTokens detect CSS custom properties automatically.",
  },
  {
    title: "Preset Swatches",
    description:
      "Solid color swatches and gradient swatches with keyboard navigation and active state indicators.",
  },
  {
    title: "Alpha Support",
    description:
      "Full opacity control with alpha slider. Checkerboard pattern for transparency preview.",
  },
  {
    title: "Pre-composed Presets",
    description:
      "ColorPickerPopover and ColorPickerInline for common layouts. Import from /presets sub-path.",
  },
  {
    title: "CSS Theming",
    description:
      "Style every part with CSS custom properties. Ships a default theme with light and dark modes.",
  },
  {
    title: "Accessible",
    description:
      "Full keyboard navigation, ARIA labels, and screen reader support. Built on Radix UI primitives.",
  },
  {
    title: "Tree-shakeable",
    description:
      "ESM + CJS dual builds. Import only what you use. Only CSS files have side effects.",
  },
  {
    title: "Utilities",
    description:
      "toCSS, fromCSS, parseColor, formatColor, and more. Use them standalone or with the components.",
  },
];


const API_COMPONENTS = [
  { name: "ColorPicker", description: "Root provider and context. Accepts tokens and autoTokens props." },
  { name: "ColorPickerArea", description: "Saturation/brightness 2D area" },
  { name: "ColorPickerHueSlider", description: "Hue selection slider" },
  { name: "ColorPickerAlphaSlider", description: "Opacity slider" },
  { name: "ColorPickerInput", description: "Color value text input with token badge and search" },
  { name: "ColorPickerFormatToggle", description: "HEX/RGB/HSL switcher" },
  { name: "ColorPickerEyeDropper", description: "Native color sampling" },
  { name: "ColorPickerSwatches", description: "Preset color swatches" },
  { name: "ColorPickerTrigger", description: "Popover trigger button" },
  { name: "ColorPickerInputTrigger", description: "Input-style trigger" },
  { name: "ColorPickerContent", description: "Popover content wrapper" },
  { name: "ColorPickerModeSelector", description: "Solid/gradient toggle" },
  {
    name: "ColorPickerGradientEditor",
    description: "Gradient preview and stop editor",
  },
  {
    name: "ColorPickerGradientSwatches",
    description: "Preset gradient swatches",
  },
  { name: "GradientPreview", description: "Standalone gradient preview" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[1000px] px-6 md:px-10">
      {/* Hero */}
      <section className="grid items-start gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            @markoradak/color-picker
          </h1>
          <p className="text-[#666]">
            Compound-component React color picker and gradient editor.
            Composable, accessible, tree-shakeable.
          </p>

          <CodeBlock code={INSTALL_CODE} language="bash" />

          <div className="flex items-center gap-3">
            <a
              href="#playground"
              className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-[#0f0f0f] transition-opacity hover:opacity-90"
            >
              Playground
            </a>
            <a
              href="https://github.com/markoradak/color-picker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-[#e5e5e5] px-4 py-2 text-sm text-[#666] transition-colors hover:text-accent dark:border-[#2a2a2a]"
            >
              GitHub
            </a>
            <span className="ml-auto">
              <ThemeToggle />
            </span>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroDemo />
        </div>
      </section>

      {/* Playground */}
      <hr className="border-[#e5e5e5] dark:border-[#2a2a2a]" />
      <section id="playground" className="py-16 sm:py-24">
        <h2 className="mb-2 text-xl font-bold sm:text-2xl">Playground</h2>
        <p className="mb-8 text-sm text-[#666]">
          Configure the color picker interactively and copy the generated code.
        </p>
        <PlaygroundClient />
      </section>

      {/* Features */}
      <hr className="border-[#e5e5e5] dark:border-[#2a2a2a]" />
      <section className="py-16 sm:py-24">
        <h2 className="mb-10 text-xl font-bold sm:text-2xl">Features</h2>
        <div className="grid gap-x-16 gap-y-8 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#666]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <hr className="border-[#e5e5e5] dark:border-[#2a2a2a]" />
      <section className="py-16 sm:py-24">
        <h2 className="mb-10 text-xl font-bold sm:text-2xl">Code Examples</h2>

        <div className="flex flex-col gap-12">
          <div>
            <h3 className="mb-2 text-sm font-semibold">
              Compound Component Popover
            </h3>
            <p className="mb-4 text-sm text-[#666]">
              Trigger button opens a popover with composable color picker
              controls. Built on Radix Popover.
            </p>
            <CodeBlock code={COMPOUND_EXAMPLE} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Gradient Editor</h3>
            <p className="mb-4 text-sm text-[#666]">
              Pass a gradient value to enable gradient mode with stop editing,
              type switching, and angle controls.
            </p>
            <CodeBlock code={GRADIENT_EXAMPLE} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Color Tokens</h3>
            <p className="mb-4 text-sm text-[#666]">
              Pass named color tokens to the root provider. The input shows a
              badge when the current color matches a token and a searchable
              dropdown to browse all tokens. CSS custom properties are
              auto-detected by default — set autoTokens={"{false}"} to disable.
            </p>
            <CodeBlock code={TOKENS_EXAMPLE} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Pre-composed Preset</h3>
            <p className="mb-4 text-sm text-[#666]">
              ColorPickerInline from /presets for a quick inline picker with all
              features enabled.
            </p>
            <CodeBlock code={PRESET_EXAMPLE} />
          </div>
        </div>
      </section>

      {/* API Reference */}
      <hr className="border-[#e5e5e5] dark:border-[#2a2a2a]" />
      <section className="py-16 sm:py-24">
        <h2 className="mb-10 text-xl font-bold sm:text-2xl">
          Component Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-left dark:border-[#2a2a2a]">
                <th className="pb-3 pr-8 font-semibold">Component</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {API_COMPONENTS.map((c) => (
                <tr
                  key={c.name}
                  className="border-b border-[#e5e5e5] dark:border-[#2a2a2a]"
                >
                  <td className="py-2.5 pr-8 font-medium">{c.name}</td>
                  <td className="py-2.5 text-[#666]">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <hr className="border-[#e5e5e5] dark:border-[#2a2a2a]" />
      <footer className="py-8 text-sm text-[#666]">
        <p>
          Built by{" "}
          <a
            href="https://markoradak.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            Marko Radak
          </a>
          . Source on{" "}
          <a
            href="https://github.com/markoradak/color-picker"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
