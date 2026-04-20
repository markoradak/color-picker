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

const CONTRAST_EXAMPLE = `import { useState } from "react";
import { ColorPickerPopover } from "@markoradak/color-picker/presets";

function AccessibleColorPicker() {
  const [color, setColor] = useState("#16db89");
  const [bg, setBg] = useState("#ffffff");

  // Pass contrastColor to enable the WCAG readout + threshold curve.
  // onContrastColorChange lets users swap the reference color via the popover.
  return (
    <ColorPickerPopover
      value={color}
      onValueChange={setColor}
      contrastColor={bg}
      onContrastColorChange={setBg}
    />
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
      "Radix-style composable API with forwardRef on all components and full HTML props spreading. Pick only the parts you need and arrange them however you want.",
  },
  {
    title: "Gradient Editor",
    description:
      "Linear, radial, conic, and mesh gradients with interactive stop editing, angle controls, type switching, and a discriminated union type system.",
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
    title: "WCAG Contrast Checking",
    description:
      "Built-in contrast-ratio readout, AA/AAA badge, and a threshold curve drawn across the saturation/brightness area so users can see which colors pass. Exposed as both composable components and a preset prop.",
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
      "Full keyboard navigation, ARIA labels, screen reader support, and reduced-motion respect. Built on Radix UI primitives. Concurrent Mode safe.",
  },
  {
    title: "Tree-shakeable",
    description:
      "ESM + CJS dual builds with optimized re-render performance. Import only what you use. Only CSS files have side effects.",
  },
];


const API_COMPONENTS = [
  { name: "ColorPicker", description: "Root provider and context. Accepts tokens and autoTokens props." },
  { name: "ColorPickerProvider", description: "Headless provider without Radix Popover (for custom layouts)" },
  { name: "ColorPickerTrigger", description: "Popover trigger button with color swatch" },
  { name: "ColorPickerInputTrigger", description: "Input-style trigger with inline editing and token badge" },
  { name: "ColorPickerContent", description: "Popover content wrapper with portal support" },
  { name: "ColorPickerModeSelector", description: "Solid/gradient mode radio group toggle" },
  { name: "ColorPickerModeSelectorItem", description: "Individual mode option (solid, linear, radial, conic, mesh)" },
  { name: "ColorPickerArea", description: "Saturation/brightness 2D area" },
  { name: "ColorPickerAreaGradient", description: "Area background gradient layer (sub-component)" },
  { name: "ColorPickerAreaThumb", description: "Area draggable thumb (sub-component)" },
  { name: "ColorPickerHueSlider", description: "Hue selection slider" },
  { name: "ColorPickerHueSliderTrack", description: "Hue slider rainbow track (sub-component)" },
  { name: "ColorPickerHueSliderThumb", description: "Hue slider draggable thumb (sub-component)" },
  { name: "ColorPickerAlphaSlider", description: "Opacity slider with checkerboard pattern" },
  { name: "ColorPickerAlphaSliderTrack", description: "Alpha slider gradient track (sub-component)" },
  { name: "ColorPickerAlphaSliderThumb", description: "Alpha slider draggable thumb (sub-component)" },
  { name: "ColorPickerInput", description: "Color value text input with token badge and search" },
  { name: "ColorPickerFormatToggle", description: "HEX/RGB/HSL/OKLCH format switcher" },
  { name: "ColorPickerEyeDropper", description: "Native color sampling via the EyeDropper API" },
  { name: "ColorPickerSwatches", description: "Preset color swatches grid" },
  { name: "ColorPickerSwatch", description: "Individual color swatch button (sub-component)" },
  { name: "ColorPickerGradientEditor", description: "Gradient preview and stop editor" },
  { name: "ColorPickerGradientSwatches", description: "Preset gradient swatches grid" },
  { name: "ColorPickerGradientSwatch", description: "Individual gradient swatch button (sub-component)" },
  { name: "ColorPickerContrastInfo", description: "WCAG contrast-ratio readout with level badge and optional reference-color popover" },
  { name: "ColorPickerContrastLine", description: "SVG overlay for the color area drawing the WCAG threshold curve and failing region" },
  { name: "GradientPreview", description: "Standalone gradient preview with angle/position controls" },
  { name: "GradientStops", description: "Standalone gradient stop bar with draggable markers" },
  { name: "TokenList", description: "Searchable token dropdown list with keyboard navigation" },
  { name: "ColorPickerPopover", description: "Pre-composed popover preset with all controls (from /presets)" },
  { name: "ColorPickerInline", description: "Pre-composed inline preset with all controls (from /presets)" },
  { name: "ColorPickerControls", description: "Shared inner layout used by both presets (from /presets)" },
];

const API_HOOKS = [
  { name: "useColorPicker", description: "Core color picker state management with HSVA internals and controlled/uncontrolled support" },
  { name: "useGradient", description: "Gradient editor state — type switching, stop CRUD, active stop tracking" },
  { name: "useColorPickerContext", description: "Access color picker context from any child component" },
  { name: "usePointerDrag", description: "Pointer drag interaction hook for building custom controls" },
  { name: "useTokenDropdown", description: "Shared dropdown state machine for token search, keyboard navigation, and click-outside dismissal" },
  { name: "useAutoTokens", description: "Auto-detect CSS custom property color tokens (SSR-safe, post-mount)" },
];

const API_UTILITIES = [
  { name: "toCSS / fromCSS", description: "Convert between ColorPickerValue and CSS strings (supports all gradient types)" },
  { name: "isGradient / isSolidColor", description: "Type guards for narrowing ColorPickerValue discriminated union" },
  { name: "parseColor / formatColor", description: "Parse and format colors between HEX, RGB, HSL, and OKLCH" },
  { name: "detectFormat / isValidColor", description: "Detect color format and validate color strings" },
  { name: "toHSVA / fromHSVA", description: "Convert between color strings and internal HSVA representation" },
  { name: "getContrastColor", description: "Get accessible text color (black or white) for a given background" },
  { name: "contrastRatio / getWcagLevel", description: "Compute WCAG 2.1 contrast ratio and classify it as AAA, AA, AA18, or Fail" },
  { name: "colorLuminance / hsvLuminance / contrastFromLuminances", description: "Lower-level luminance and contrast helpers for building custom accessibility UI" },
  { name: "getEffectiveBackgroundColor", description: "Walk the DOM to find the first non-transparent background color behind an element" },
  { name: "resolveToken / findMatchingToken", description: "Resolve token names to values and find tokens matching a color" },
  { name: "getCSSColorTokens", description: "Extract color tokens from CSS custom properties on the page" },
  { name: "createGradientStop / createMeshGradientStop", description: "Create gradient stop objects with auto-generated IDs" },
  { name: "addStop / addStopWithCoordinates / removeStop / updateStop / moveStop", description: "Gradient stop CRUD and repositioning helpers (addStopWithCoordinates is mesh-only)" },
  { name: "sortStops / interpolateColorAt", description: "Sort stops by position and interpolate colors at a given point" },
  { name: "createDefaultGradient / createDefaultGradientFromColor", description: "Create default gradient values by type, optionally from an existing color" },
  { name: "clamp / getRelativePosition / angleFromPosition", description: "Position math utilities for custom control implementations" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[1000px] px-6 md:px-10">
      {/* Hero */}
      <section className="grid items-start gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <h1 className="whitespace-nowrap text-2xl font-bold sm:text-3xl">
            @markoradak/color-picker
          </h1>
          <p className="text-[#666]">
            Compound-component React color picker and gradient editor.
            Composable, accessible, tree-shakeable. forwardRef and HTML
            props on all components.
          </p>

          <CodeBlock code={INSTALL_CODE} language="bash" />

          <div className="flex items-center gap-3">
            <a
              href="#playground"
              className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-[#0f0f0f] outline-none transition-[opacity,box-shadow] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-ring-offset"
            >
              Playground
            </a>
            <a
              href="https://github.com/markoradak/color-picker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-[#e5e5e5] px-4 py-2 text-sm text-[#666] outline-none transition-[color,box-shadow] hover:text-accent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-ring-offset dark:border-[#2a2a2a]"
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
            <h3 className="mb-2 text-sm font-semibold">WCAG Contrast Checking</h3>
            <p className="mb-4 text-sm text-[#666]">
              Pass a contrastColor to render the contrast-ratio readout, WCAG
              level badge, and a threshold curve across the color area.
            </p>
            <CodeBlock code={CONTRAST_EXAMPLE} />
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
          API Reference
        </h2>

        <h3 className="mb-4 text-sm font-semibold">Components</h3>
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

        <h3 className="mb-4 mt-10 text-sm font-semibold">Hooks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-left dark:border-[#2a2a2a]">
                <th className="pb-3 pr-8 font-semibold">Hook</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {API_HOOKS.map((h) => (
                <tr
                  key={h.name}
                  className="border-b border-[#e5e5e5] dark:border-[#2a2a2a]"
                >
                  <td className="py-2.5 pr-8 font-medium">{h.name}</td>
                  <td className="py-2.5 text-[#666]">{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-4 mt-10 text-sm font-semibold">Utilities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-left dark:border-[#2a2a2a]">
                <th className="pb-3 pr-8 font-semibold">Utility</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {API_UTILITIES.map((u) => (
                <tr
                  key={u.name}
                  className="border-b border-[#e5e5e5] dark:border-[#2a2a2a]"
                >
                  <td className="py-2.5 pr-8 font-medium">{u.name}</td>
                  <td className="py-2.5 text-[#666]">{u.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <hr className="border-[#e5e5e5] dark:border-[#2a2a2a]" />
      <footer className="flex items-center justify-between py-12 text-xs text-[#999]">
        <p>&copy; {new Date().getFullYear()} MIT License</p>
        <p>
          Built by{" "}
          <a
            href="https://markoradak.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded outline-none transition-[color,box-shadow] hover:text-accent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-ring-offset"
          >
            Marko Radak
          </a>
        </p>
      </footer>
    </main>
  );
}
