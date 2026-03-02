"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerInput,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerGradientEditor,
  ColorPickerGradientSwatches,
  ColorPickerModeSelector,
  ColorPickerTrigger,
  ColorPickerInputTrigger,
  ColorPickerContent,
  toCSS,
} from "@markoradak/color-picker";
import type { ColorPickerValue, GradientValue } from "@markoradak/color-picker";
import { CopyButton } from "../copy-button";

const DEFAULT_COLOR = "#3b82f6";

const DEFAULT_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const DEFAULT_GRADIENT_SWATCHES: GradientValue[] = [
  // --- Linear (8) ---
  // Sunset Glow
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l1a", color: "#FF512F", position: 0 },
      { id: "l1b", color: "#DD2476", position: 100 },
    ],
  },
  // Ocean Breeze
  {
    type: "linear",
    angle: 90,
    stops: [
      { id: "l2a", color: "#2193B0", position: 0 },
      { id: "l2b", color: "#6DD5ED", position: 100 },
    ],
  },
  // Aurora
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l3a", color: "#5433FF", position: 0 },
      { id: "l3b", color: "#20BDFF", position: 50 },
      { id: "l3c", color: "#A5FECB", position: 100 },
    ],
  },
  // Soft Blossom
  {
    type: "linear",
    angle: 90,
    stops: [
      { id: "l4a", color: "#FF9A9E", position: 0 },
      { id: "l4b", color: "#FECFEF", position: 100 },
    ],
  },
  // Midnight
  {
    type: "linear",
    angle: 180,
    stops: [
      { id: "l5a", color: "#09203F", position: 0 },
      { id: "l5b", color: "#537895", position: 100 },
    ],
  },
  // Emerald Forest
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l6a", color: "#56AB2F", position: 0 },
      { id: "l6b", color: "#A8E063", position: 100 },
    ],
  },
  // Orchid Dusk
  {
    type: "linear",
    angle: 45,
    stops: [
      { id: "l7a", color: "#614385", position: 0 },
      { id: "l7b", color: "#516395", position: 100 },
    ],
  },
  // Platinum
  {
    type: "linear",
    angle: 90,
    stops: [
      { id: "l8a", color: "#BDC3C7", position: 0 },
      { id: "l8b", color: "#2C3E50", position: 100 },
    ],
  },
  // --- Radial (8) ---
  // Solar Glow
  {
    type: "radial",
    stops: [
      { id: "r1a", color: "#FFD700", position: 0 },
      { id: "r1b", color: "#FF4500", position: 100 },
    ],
  },
  // Violet Orb
  {
    type: "radial",
    stops: [
      { id: "r2a", color: "#BF5AE0", position: 0 },
      { id: "r2b", color: "#2D0845", position: 100 },
    ],
  },
  // Cyan Pulse
  {
    type: "radial",
    stops: [
      { id: "r3a", color: "#00F5A0", position: 0 },
      { id: "r3b", color: "#00408A", position: 100 },
    ],
  },
  // Crimson Spot
  {
    type: "radial",
    stops: [
      { id: "r4a", color: "#FF758C", position: 0 },
      { id: "r4b", color: "#1A0010", position: 100 },
    ],
  },
  // Arctic Glow
  {
    type: "radial",
    stops: [
      { id: "r5a", color: "#E0F4FF", position: 0 },
      { id: "r5b", color: "#1B3A5C", position: 100 },
    ],
  },
  // Rose Vignette
  {
    type: "radial",
    stops: [
      { id: "r6a", color: "#FFC3A0", position: 0 },
      { id: "r6b", color: "#870057", position: 100 },
    ],
  },
  // Emerald Lens
  {
    type: "radial",
    stops: [
      { id: "r7a", color: "#93F9B9", position: 0 },
      { id: "r7b", color: "#1D976C", position: 100 },
    ],
  },
  // Obsidian
  {
    type: "radial",
    stops: [
      { id: "r8a", color: "#485563", position: 0 },
      { id: "r8b", color: "#0D0D0D", position: 100 },
    ],
  },
  // --- Conic (8) ---
  // Color Wheel
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c1a", color: "#ff0000", position: 0 },
      { id: "c1b", color: "#ffff00", position: 17 },
      { id: "c1c", color: "#00ff00", position: 33 },
      { id: "c1d", color: "#00ffff", position: 50 },
      { id: "c1e", color: "#0000ff", position: 67 },
      { id: "c1f", color: "#ff00ff", position: 83 },
      { id: "c1g", color: "#ff0000", position: 100 },
    ],
  },
  // Sunset Cone
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c2a", color: "#F5AF19", position: 0 },
      { id: "c2b", color: "#F12711", position: 50 },
      { id: "c2c", color: "#F5AF19", position: 100 },
    ],
  },
  // Holographic
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c3a", color: "#FF6B6B", position: 0 },
      { id: "c3b", color: "#4ECDC4", position: 25 },
      { id: "c3c", color: "#45B7D1", position: 50 },
      { id: "c3d", color: "#96E6A1", position: 75 },
      { id: "c3e", color: "#FF6B6B", position: 100 },
    ],
  },
  // Chrome
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c4a", color: "#E8E8E8", position: 0 },
      { id: "c4b", color: "#7F7F7F", position: 25 },
      { id: "c4c", color: "#E8E8E8", position: 50 },
      { id: "c4d", color: "#7F7F7F", position: 75 },
      { id: "c4e", color: "#E8E8E8", position: 100 },
    ],
  },
  // Neon Pie
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c5a", color: "#FF00FF", position: 0 },
      { id: "c5b", color: "#00FFFF", position: 50 },
      { id: "c5c", color: "#FF00FF", position: 100 },
    ],
  },
  // Royal Spectrum
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c6a", color: "#2D0845", position: 0 },
      { id: "c6b", color: "#614385", position: 25 },
      { id: "c6c", color: "#516395", position: 50 },
      { id: "c6d", color: "#614385", position: 75 },
      { id: "c6e", color: "#2D0845", position: 100 },
    ],
  },
  // Forest Mandala
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c7a", color: "#134E5E", position: 0 },
      { id: "c7b", color: "#71B280", position: 50 },
      { id: "c7c", color: "#134E5E", position: 100 },
    ],
  },
  // Lava Sweep
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c8a", color: "#FF4E50", position: 0 },
      { id: "c8b", color: "#FC913A", position: 25 },
      { id: "c8c", color: "#F9D423", position: 50 },
      { id: "c8d", color: "#FC913A", position: 75 },
      { id: "c8e", color: "#FF4E50", position: 100 },
    ],
  },
  // --- Mesh (8) ---
  // Coral Reef
  {
    type: "mesh",
    baseColor: "#FFF5F0",
    stops: [
      { id: "m1a", color: "#FF6B6B", position: 0, x: 20, y: 20 },
      { id: "m1b", color: "#FFC371", position: 50, x: 80, y: 30 },
      { id: "m1c", color: "#4ECDC4", position: 100, x: 50, y: 80 },
    ],
  },
  // Nebula
  {
    type: "mesh",
    baseColor: "#0D0221",
    stops: [
      { id: "m2a", color: "#7B2FBE", position: 0, x: 15, y: 15 },
      { id: "m2b", color: "#0652DD", position: 33, x: 85, y: 25 },
      { id: "m2c", color: "#E84393", position: 66, x: 25, y: 85 },
      { id: "m2d", color: "#00D2D3", position: 100, x: 80, y: 75 },
    ],
  },
  // Tropical
  {
    type: "mesh",
    baseColor: "#FFF8E1",
    stops: [
      { id: "m3a", color: "#F9D423", position: 0, x: 10, y: 10 },
      { id: "m3b", color: "#FF4E50", position: 50, x: 90, y: 40 },
      { id: "m3c", color: "#1B9CFC", position: 100, x: 40, y: 90 },
    ],
  },
  // Aurora Mesh
  {
    type: "mesh",
    baseColor: "#0A1628",
    stops: [
      { id: "m4a", color: "#A5FECB", position: 0, x: 20, y: 10 },
      { id: "m4b", color: "#20BDFF", position: 33, x: 80, y: 20 },
      { id: "m4c", color: "#5433FF", position: 66, x: 50, y: 60 },
      { id: "m4d", color: "#09203F", position: 100, x: 50, y: 95 },
    ],
  },
  // Peach Blossom
  {
    type: "mesh",
    baseColor: "#FFF0F5",
    stops: [
      { id: "m5a", color: "#FFDEE9", position: 0, x: 25, y: 25 },
      { id: "m5b", color: "#B5FFFC", position: 50, x: 75, y: 30 },
      { id: "m5c", color: "#FFC3A0", position: 100, x: 50, y: 80 },
    ],
  },
  // Deep Ocean
  {
    type: "mesh",
    baseColor: "#071A2B",
    stops: [
      { id: "m6a", color: "#0F2027", position: 0, x: 10, y: 10 },
      { id: "m6b", color: "#203A43", position: 33, x: 80, y: 20 },
      { id: "m6c", color: "#2C5364", position: 66, x: 20, y: 80 },
      { id: "m6d", color: "#00B4DB", position: 100, x: 85, y: 85 },
    ],
  },
  // Candy Pop
  {
    type: "mesh",
    baseColor: "#FFFFFF",
    stops: [
      { id: "m7a", color: "#FF00FF", position: 0, x: 15, y: 30 },
      { id: "m7b", color: "#00FFFF", position: 33, x: 85, y: 15 },
      { id: "m7c", color: "#FFFF00", position: 66, x: 80, y: 85 },
      { id: "m7d", color: "#FF6B6B", position: 100, x: 20, y: 80 },
    ],
  },
  // Ember
  {
    type: "mesh",
    baseColor: "#1A0505",
    stops: [
      { id: "m8a", color: "#1A0010", position: 0, x: 15, y: 15 },
      { id: "m8b", color: "#FF4500", position: 50, x: 70, y: 40 },
      { id: "m8c", color: "#FFD700", position: 100, x: 85, y: 85 },
    ],
  },
];

interface PlaygroundOptions {
  variant: "inline" | "popover";
  triggerMode: "thumbnail" | "input";
  showAlpha: boolean;
  showEyeDropper: boolean;
  showSwatches: boolean;
  showInput: boolean;
  enableGradient: boolean;
  swatchColors: string[];
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked
            ? "bg-blue-500"
            : "bg-neutral-300 dark:bg-neutral-600"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </label>
  );
}

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      <div
        className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.value)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function generateCode(options: PlaygroundOptions): string {
  const imports: string[] = ["ColorPicker", "ColorPickerArea", "ColorPickerHueSlider"];

  if (options.showAlpha) imports.push("ColorPickerAlphaSlider");
  if (options.showInput) imports.push("ColorPickerInput");
  if (options.showEyeDropper) imports.push("ColorPickerEyeDropper");
  if (options.showSwatches) imports.push("ColorPickerSwatches");
  if (options.enableGradient) {
    imports.push("ColorPickerModeSelector");
    imports.push("ColorPickerGradientEditor");
    imports.push("ColorPickerGradientSwatches");
  }
  if (options.variant === "popover") {
    if (options.triggerMode === "input") {
      imports.push("ColorPickerInputTrigger");
    } else {
      imports.push("ColorPickerTrigger");
    }
    imports.push("ColorPickerContent");
  }

  const importLine = `import {\n  ${imports.join(",\n  ")},\n} from "@markoradak/color-picker";`;

  let typeLine = "";
  if (options.enableGradient) {
    typeLine = `\nimport type { ColorPickerValue } from "@markoradak/color-picker";\n`;
  }

  let stateLine: string;
  if (options.enableGradient) {
    stateLine = `const [value, setValue] = useState<ColorPickerValue>("${DEFAULT_COLOR}");`;
  } else {
    stateLine = `const [color, setColor] = useState("${DEFAULT_COLOR}");`;
  }

  const valueVar = options.enableGradient ? "value" : "color";
  const setterVar = options.enableGradient ? "setValue" : "setColor";

  const parts: string[] = [];
  if (options.enableGradient) {
    parts.push("    <ColorPickerModeSelector />");
  }
  parts.push("    <ColorPickerArea />");
  parts.push("    <ColorPickerHueSlider />");
  if (options.showAlpha) parts.push("    <ColorPickerAlphaSlider />");

  const inputRow: string[] = [];
  if (options.showInput) inputRow.push("      <ColorPickerInput />");
  if (options.showEyeDropper) inputRow.push("      <ColorPickerEyeDropper />");

  if (inputRow.length > 0) {
    parts.push(`    <div className="flex items-center gap-2">\n${inputRow.join("\n")}\n    </div>`);
  }

  if (options.showSwatches) {
    const swatchesStr = options.swatchColors.map((c) => `"${c}"`).join(", ");
    parts.push(`    <ColorPickerSwatches colors={[${swatchesStr}]} />`);
  }

  if (options.enableGradient) {
    parts.push("    <ColorPickerGradientEditor />");
    parts.push("    <ColorPickerGradientSwatches gradients={gradientSwatches} />");
  }

  const innerJsx = parts.join("\n");

  let jsx: string;
  if (options.variant === "popover") {
    const triggerTag = options.triggerMode === "input"
      ? "<ColorPickerInputTrigger />"
      : "<ColorPickerTrigger />";
    jsx = `  <ColorPicker value={${valueVar}} onValueChange={${setterVar}}>
    ${triggerTag}
    <ColorPickerContent>
${innerJsx}
    </ColorPickerContent>
  </ColorPicker>`;
  } else {
    jsx = `  <ColorPicker value={${valueVar}} onValueChange={${setterVar}}>
${innerJsx}
  </ColorPicker>`;
  }

  return `${importLine}${typeLine}

function MyColorPicker() {
  ${stateLine}

  return (
${jsx}
  );
}`;
}

export function PlaygroundClient() {
  const [options, setOptions] = useState<PlaygroundOptions>({
    variant: "inline",
    triggerMode: "thumbnail",
    showAlpha: true,
    showEyeDropper: true,
    showSwatches: true,
    showInput: true,
    enableGradient: true,
    swatchColors: DEFAULT_SWATCHES,
  });

  const [value, setValue] = useState<ColorPickerValue>(DEFAULT_COLOR);
  const cssValue = typeof value === "string" ? value : toCSS(value);

  const generatedCode = useMemo(() => generateCode(options), [options]);

  const updateOption = useCallback(
    <K extends keyof PlaygroundOptions>(key: K, val: PlaygroundOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: val }));
    },
    []
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* Left: Live picker + options */}
      <div className="flex flex-col gap-6">
        {/* Live picker */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Preview
          </h2>
          <div className="flex justify-center">
            {options.variant === "popover" ? (
              <PopoverPicker
                value={value}
                onValueChange={setValue}
                options={options}
              />
            ) : (
              <InlinePicker
                value={value}
                onValueChange={setValue}
                options={options}
              />
            )}
          </div>

          {/* CSS output */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              CSS Output
            </p>
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 shrink-0 rounded-md border border-neutral-200 dark:border-neutral-700"
                style={{ background: cssValue }}
              />
              <div className="relative flex-1">
                <code className="block overflow-x-auto rounded-md bg-neutral-100 px-3 py-2 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {cssValue}
                </code>
                <CopyButton text={cssValue} />
              </div>
            </div>
          </div>
        </div>

        {/* Options panel */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Options
          </h2>
          <div className="flex flex-col gap-4">
            <SegmentedControl
              label="Variant"
              options={[
                { value: "inline", label: "Inline" },
                { value: "popover", label: "Popover" },
              ]}
              value={options.variant}
              onChange={(v) =>
                updateOption("variant", v as "inline" | "popover")
              }
            />

            {options.variant === "popover" && (
              <SegmentedControl
                label="Trigger mode"
                options={[
                  { value: "thumbnail", label: "Thumbnail" },
                  { value: "input", label: "Input" },
                ]}
                value={options.triggerMode}
                onChange={(v) =>
                  updateOption("triggerMode", v as "thumbnail" | "input")
                }
              />
            )}

            <hr className="border-neutral-200 dark:border-neutral-700" />

            <Toggle
              label="Gradient mode"
              checked={options.enableGradient}
              onChange={(v) => updateOption("enableGradient", v)}
            />
            <Toggle
              label="Alpha slider"
              checked={options.showAlpha}
              onChange={(v) => updateOption("showAlpha", v)}
            />
            <Toggle
              label="Color input"
              checked={options.showInput}
              onChange={(v) => updateOption("showInput", v)}
            />
            <Toggle
              label="EyeDropper"
              checked={options.showEyeDropper}
              onChange={(v) => updateOption("showEyeDropper", v)}
            />
            <Toggle
              label="Swatches"
              checked={options.showSwatches}
              onChange={(v) => updateOption("showSwatches", v)}
            />
          </div>
        </div>
      </div>

      {/* Right: Generated code */}
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Generated Code
            </h2>
          </div>
          <div className="relative">
            <pre className="max-h-[600px] overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed dark:border-neutral-700 dark:bg-neutral-800">
              <code className="font-mono text-neutral-800 dark:text-neutral-200">
                {generatedCode}
              </code>
            </pre>
            <CopyButton text={generatedCode} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InlinePicker({
  value,
  onValueChange,
  options,
}: {
  value: ColorPickerValue;
  onValueChange: (v: ColorPickerValue) => void;
  options: PlaygroundOptions;
}) {
  const isGradientMode = typeof value !== "string";

  return (
    <div className="w-full max-w-[272px]">
      <ColorPicker value={value} onValueChange={onValueChange}>
        <div className="flex flex-col gap-3">
          {options.enableGradient && <ColorPickerModeSelector />}
          {isGradientMode ? (
            <>
              <ColorPickerGradientEditor />
              {options.showSwatches && (
                <ColorPickerGradientSwatches gradients={DEFAULT_GRADIENT_SWATCHES} className="mt-0.5" />
              )}
            </>
          ) : (
            <>
              <ColorPickerArea />
              <ColorPickerHueSlider />
              {options.showAlpha && <ColorPickerAlphaSlider />}
              {(options.showInput || options.showEyeDropper) && (
                <div className="flex items-center gap-2">
                  {options.showInput && <ColorPickerInput className="flex-1" />}
                  {options.showEyeDropper && <ColorPickerEyeDropper />}
                </div>
              )}
              {options.showSwatches && (
                <ColorPickerSwatches colors={options.swatchColors} />
              )}
            </>
          )}
        </div>
      </ColorPicker>
    </div>
  );
}

function PopoverPicker({
  value,
  onValueChange,
  options,
}: {
  value: ColorPickerValue;
  onValueChange: (v: ColorPickerValue) => void;
  options: PlaygroundOptions;
}) {
  const isGradientMode = typeof value !== "string";

  return (
    <ColorPicker value={value} onValueChange={onValueChange}>
      {options.triggerMode === "input" ? (
        <ColorPickerInputTrigger />
      ) : (
        <ColorPickerTrigger />
      )}
      <ColorPickerContent>
        {options.enableGradient && <ColorPickerModeSelector />}
        {isGradientMode ? (
          <>
            <ColorPickerGradientEditor />
            {options.showSwatches && (
              <ColorPickerGradientSwatches gradients={DEFAULT_GRADIENT_SWATCHES} className="mt-0.5" />
            )}
          </>
        ) : (
          <>
            <ColorPickerArea />
            <ColorPickerHueSlider />
            {options.showAlpha && <ColorPickerAlphaSlider />}
            {(options.showInput || options.showEyeDropper) && (
              <div className="flex items-center gap-2">
                {options.showInput && <ColorPickerInput className="flex-1" />}
                {options.showEyeDropper && <ColorPickerEyeDropper />}
              </div>
            )}
            {options.showSwatches && (
              <ColorPickerSwatches colors={options.swatchColors} />
            )}
          </>
        )}
      </ColorPickerContent>
    </ColorPicker>
  );
}
