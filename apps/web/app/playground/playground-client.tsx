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
import type { ColorPickerValue } from "@markoradak/color-picker";
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
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="flex flex-col">
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
        {description && (
          <span className="text-xs text-neutral-500 dark:text-neutral-500">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked
            ? "bg-[#16db89]"
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

  if (options.showInput) parts.push("    <ColorPickerInput />");
  if (options.showEyeDropper) parts.push("    <ColorPickerEyeDropper />");

  if (options.showSwatches) {
    parts.push("    <ColorPickerSwatches {/* values={[...]} */} />");
  }

  if (options.enableGradient) {
    parts.push("    <ColorPickerGradientEditor />");
    parts.push("    <ColorPickerGradientSwatches {/* values={[...]} */} />");
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
    triggerMode: "input",
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
    <div className="flex flex-col gap-8">
      {/* Top: Preview + Options side by side */}
      <div className="grid gap-6 sm:grid-cols-[minmax(0,_21rem)_1fr]">
        {/* Preview */}
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
        </div>

        {/* Options */}
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
                  { value: "input", label: "Input" },
                  { value: "thumbnail", label: "Thumbnail" },
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
              description="Linear, radial, conic, and mesh gradients"
              checked={options.enableGradient}
              onChange={(v) => updateOption("enableGradient", v)}
            />
            <Toggle
              label="Alpha slider"
              description="Adjust color transparency"
              checked={options.showAlpha}
              onChange={(v) => updateOption("showAlpha", v)}
            />
            <Toggle
              label="Color input"
              description="HEX, RGB, and HSL text input"
              checked={options.showInput}
              onChange={(v) => updateOption("showInput", v)}
            />
            <Toggle
              label="EyeDropper"
              description="Sample colors from the screen"
              checked={options.showEyeDropper}
              onChange={(v) => updateOption("showEyeDropper", v)}
            />
            <Toggle
              label="Swatches"
              description="Preset color palette"
              checked={options.showSwatches}
              onChange={(v) => updateOption("showSwatches", v)}
            />
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          CSS Output
        </h2>
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

      {/* Generated code */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Generated Code
          </h2>
        </div>
        <div className="relative">
          <pre className="overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed dark:border-neutral-700 dark:bg-neutral-800">
            <code className="font-mono text-neutral-800 dark:text-neutral-200">
              {generatedCode}
            </code>
          </pre>
          <CopyButton text={generatedCode} />
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
    <div className="w-full">
      <ColorPicker value={value} onValueChange={onValueChange}>
        <div className="flex flex-col gap-3">
          {options.enableGradient && <ColorPickerModeSelector />}
          {isGradientMode ? (
            <>
              <ColorPickerGradientEditor />
              {options.showSwatches && (
                <ColorPickerGradientSwatches className="mt-0.5" />
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
                <ColorPickerSwatches values={options.swatchColors} />
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
              <ColorPickerGradientSwatches className="mt-0.5" />
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
              <ColorPickerSwatches values={options.swatchColors} />
            )}
          </>
        )}
      </ColorPickerContent>
    </ColorPicker>
  );
}
