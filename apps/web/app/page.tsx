import { HeroDemo } from "./hero-demo";
import { CodeBlock } from "./code-block";

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
      enableGradient
      enableAlpha
      swatches={["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"]}
    />
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

const GRADIENT_TYPES = [
  {
    label: "Linear",
    css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    syntax: "linear-gradient(135deg, ...)",
  },
  {
    label: "Radial",
    css: "radial-gradient(circle at 30% 40%, #f093fb 0%, #f5576c 100%)",
    syntax: "radial-gradient(circle at ...)",
  },
  {
    label: "Conic",
    css: "conic-gradient(from 45deg at 50% 50%, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)",
    syntax: "conic-gradient(from 45deg ...)",
  },
  {
    label: "Mesh",
    css: [
      "radial-gradient(circle at 20% 30%, #a18cd1 0%, transparent 50%)",
      "radial-gradient(circle at 80% 20%, #fbc2eb 0%, transparent 50%)",
      "radial-gradient(circle at 50% 80%, #84fab0 0%, transparent 50%)",
    ].join(", "),
    syntax: "Layered radial gradients",
  },
];

const API_COMPONENTS = [
  { name: "ColorPicker", description: "Root provider and context" },
  { name: "ColorPickerArea", description: "Saturation/brightness 2D area" },
  { name: "ColorPickerHueSlider", description: "Hue selection slider" },
  { name: "ColorPickerAlphaSlider", description: "Opacity slider" },
  { name: "ColorPickerInput", description: "Color value text input" },
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

          <div className="flex gap-3">
            <a
              href="/playground"
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
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroDemo />
        </div>
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

      {/* Gradient Types */}
      <hr className="border-[#e5e5e5] dark:border-[#2a2a2a]" />
      <section className="py-16 sm:py-24">
        <h2 className="mb-10 text-xl font-bold sm:text-2xl">Gradient Types</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {GRADIENT_TYPES.map((g) => (
            <div key={g.label}>
              <div
                className="h-48 rounded-lg"
                style={{ background: g.css }}
              />
              <p className="mt-3 text-sm font-semibold">{g.label}</p>
              <p className="mt-0.5 text-xs text-[#666]">{g.syntax}</p>
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
