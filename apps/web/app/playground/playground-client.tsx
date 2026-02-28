"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerHueSlider,
  ColorPickerAlphaSlider,
  ColorPickerInput,
  ColorPickerFormatToggle,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerGradientEditor,
  ColorPickerGradientSwatches,
  ColorPickerModeSelector,
  ColorPickerTrigger,
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
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l1a", color: "#667eea", position: 0 },
      { id: "l1b", color: "#764ba2", position: 100 },
    ],
  },
  {
    type: "linear",
    angle: 90,
    stops: [
      { id: "l2a", color: "#f093fb", position: 0 },
      { id: "l2b", color: "#f5576c", position: 100 },
    ],
  },
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l3a", color: "#4facfe", position: 0 },
      { id: "l3b", color: "#00f2fe", position: 100 },
    ],
  },
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l4a", color: "#43e97b", position: 0 },
      { id: "l4b", color: "#38f9d7", position: 100 },
    ],
  },
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l5a", color: "#fa709a", position: 0 },
      { id: "l5b", color: "#fee140", position: 100 },
    ],
  },
  {
    type: "linear",
    angle: 90,
    stops: [
      { id: "l6a", color: "#a18cd1", position: 0 },
      { id: "l6b", color: "#fbc2eb", position: 100 },
    ],
  },
  {
    type: "linear",
    angle: 45,
    stops: [
      { id: "l7a", color: "#ff9a9e", position: 0 },
      { id: "l7b", color: "#fad0c4", position: 100 },
    ],
  },
  {
    type: "linear",
    angle: 135,
    stops: [
      { id: "l8a", color: "#0c0c0c", position: 0 },
      { id: "l8b", color: "#434343", position: 100 },
    ],
  },
  // --- Radial (8) ---
  {
    type: "radial",
    stops: [
      { id: "r1a", color: "#ffecd2", position: 0 },
      { id: "r1b", color: "#fcb69f", position: 100 },
    ],
  },
  {
    type: "radial",
    stops: [
      { id: "r2a", color: "#a1c4fd", position: 0 },
      { id: "r2b", color: "#c2e9fb", position: 100 },
    ],
  },
  {
    type: "radial",
    stops: [
      { id: "r3a", color: "#fbc2eb", position: 0 },
      { id: "r3b", color: "#a6c1ee", position: 100 },
    ],
  },
  {
    type: "radial",
    stops: [
      { id: "r4a", color: "#fddb92", position: 0 },
      { id: "r4b", color: "#d1fdff", position: 100 },
    ],
  },
  {
    type: "radial",
    stops: [
      { id: "r5a", color: "#ffffff", position: 0 },
      { id: "r5b", color: "#e6e6e6", position: 100 },
    ],
  },
  {
    type: "radial",
    stops: [
      { id: "r6a", color: "#c1dfc4", position: 0 },
      { id: "r6b", color: "#deecdd", position: 100 },
    ],
  },
  {
    type: "radial",
    stops: [
      { id: "r7a", color: "#f5f7fa", position: 0 },
      { id: "r7b", color: "#c3cfe2", position: 100 },
    ],
  },
  {
    type: "radial",
    stops: [
      { id: "r8a", color: "#e0c3fc", position: 0 },
      { id: "r8b", color: "#8ec5fc", position: 100 },
    ],
  },
  // --- Conic (8) ---
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
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c2a", color: "#f5af19", position: 0 },
      { id: "c2b", color: "#f12711", position: 50 },
      { id: "c2c", color: "#f5af19", position: 100 },
    ],
  },
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c3a", color: "#667eea", position: 0 },
      { id: "c3b", color: "#764ba2", position: 50 },
      { id: "c3c", color: "#667eea", position: 100 },
    ],
  },
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c4a", color: "#00c6ff", position: 0 },
      { id: "c4b", color: "#0072ff", position: 50 },
      { id: "c4c", color: "#00c6ff", position: 100 },
    ],
  },
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c5a", color: "#f8f9fa", position: 0 },
      { id: "c5b", color: "#dee2e6", position: 25 },
      { id: "c5c", color: "#adb5bd", position: 50 },
      { id: "c5d", color: "#dee2e6", position: 75 },
      { id: "c5e", color: "#f8f9fa", position: 100 },
    ],
  },
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c6a", color: "#43e97b", position: 0 },
      { id: "c6b", color: "#38f9d7", position: 50 },
      { id: "c6c", color: "#43e97b", position: 100 },
    ],
  },
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c7a", color: "#fa709a", position: 0 },
      { id: "c7b", color: "#fee140", position: 50 },
      { id: "c7c", color: "#fa709a", position: 100 },
    ],
  },
  {
    type: "conic",
    angle: 0,
    stops: [
      { id: "c8a", color: "#0c0c0c", position: 0 },
      { id: "c8b", color: "#444444", position: 50 },
      { id: "c8c", color: "#0c0c0c", position: 100 },
    ],
  },
];

interface PlaygroundOptions {
  variant: "inline" | "popover";
  showAlpha: boolean;
  showEyeDropper: boolean;
  showSwatches: boolean;
  showFormatToggle: boolean;
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
  if (options.showFormatToggle) imports.push("ColorPickerFormatToggle");
  if (options.showEyeDropper) imports.push("ColorPickerEyeDropper");
  if (options.showSwatches) imports.push("ColorPickerSwatches");
  if (options.enableGradient) {
    imports.push("ColorPickerModeSelector");
    imports.push("ColorPickerGradientEditor");
  }
  if (options.variant === "popover") {
    imports.push("ColorPickerTrigger");
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
  if (options.showFormatToggle) inputRow.push("      <ColorPickerFormatToggle />");
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
  }

  const innerJsx = parts.join("\n");

  let jsx: string;
  if (options.variant === "popover") {
    jsx = `  <ColorPicker value={${valueVar}} onValueChange={${setterVar}}>
    <ColorPickerTrigger />
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
    showAlpha: true,
    showEyeDropper: true,
    showSwatches: true,
    showFormatToggle: true,
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
              label="Format toggle"
              checked={options.showFormatToggle}
              onChange={(v) => updateOption("showFormatToggle", v)}
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
              {(options.showInput ||
                options.showFormatToggle ||
                options.showEyeDropper) && (
                <div className="flex items-center gap-2">
                  {options.showInput && <ColorPickerInput className="flex-1" />}
                  {options.showFormatToggle && <ColorPickerFormatToggle />}
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
      <ColorPickerTrigger />
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
            {(options.showInput ||
              options.showFormatToggle ||
              options.showEyeDropper) && (
              <div className="flex items-center gap-2">
                {options.showInput && <ColorPickerInput className="flex-1" />}
                {options.showFormatToggle && <ColorPickerFormatToggle />}
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
