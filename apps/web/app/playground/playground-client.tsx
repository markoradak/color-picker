"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "../theme-provider";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaGradient,
  ColorPickerAreaThumb,
  ColorPickerHueSlider,
  ColorPickerHueSliderTrack,
  ColorPickerHueSliderThumb,
  ColorPickerAlphaSlider,
  ColorPickerAlphaSliderTrack,
  ColorPickerAlphaSliderThumb,
  ColorPickerInput,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerSwatch,
  ColorPickerGradientEditor,
  ColorPickerGradientSwatches,
  ColorPickerGradientSwatch,
  ColorPickerModeSelector,
  ColorPickerModeSelectorItem,
  ColorPickerTrigger,
  ColorPickerInputTrigger,
  ColorPickerContent,
  ColorPickerContrastInfo,
  ColorPickerContrastLine,
  toCSS,
} from "@markoradak/color-picker";
import type { ColorPickerValue } from "@markoradak/color-picker";
import { CopyButton } from "../copy-button";
import { styles } from "../component-styles";

const DEFAULT_VALUE: ColorPickerValue = {
  type: "mesh",
  stops: [
    { id: "1", color: "#16db89", position: 0, x: 23.84, y: 26.60 },
    { id: "2", color: "#16db897f", position: 0, x: 66.00, y: 84.25 },
    { id: "3", color: "#16db8926", position: 0, x: 81.36, y: 54.36 },
  ],
  baseColor: "#e7fff5",
};

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

const DEMO_TOKENS: Record<string, string> = {
  "brand-primary": "#16db89",
  "brand-secondary": "#3b82f6",
  "danger": "#ef4444",
  "warning": "#eab308",
  "success": "#22c55e",
  "info": "#06b6d4",
  "accent-purple": "#8b5cf6",
  "accent-pink": "#ec4899",
};

interface PlaygroundOptions {
  variant: "inline" | "popover";
  triggerMode: "thumbnail" | "input";
  showAlpha: boolean;
  showEyeDropper: boolean;
  showSwatches: boolean;
  showInput: boolean;
  enableGradient: boolean;
  enableTokens: boolean;
  enableTokenSearch: boolean;
  showContrastInfo: boolean;
  contrastColor: string;
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
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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

type CompositionMode = "preset" | "composable";
type StyleMode = "tailwind" | "css" | "unstyled";

function generateCode(
  options: PlaygroundOptions,
  composition: CompositionMode,
  style: StyleMode,
): string {
  if (composition === "preset") {
    return generatePresetCode(options, style);
  }
  return generateComposableCode(options, style);
}

function generatePresetCode(options: PlaygroundOptions, style: StyleMode): string {
  const component = options.variant === "popover" ? "ColorPickerPopover" : "ColorPickerInline";
  const importLine = `import { ${component} } from "@markoradak/color-picker/presets";`;

  const extraImports: string[] = [];
  if (style === "css") {
    extraImports.push(`import "@markoradak/color-picker/styles";`);
  }

  let typeLine = "";
  if (options.enableGradient) {
    typeLine = `\nimport type { ColorPickerValue } from "@markoradak/color-picker";\n`;
  }

  let stateLine: string;
  if (options.enableGradient) {
    stateLine = `const [value, setValue] = useState<ColorPickerValue>("#16db89");`;
  } else {
    stateLine = `const [color, setColor] = useState("#16db89");`;
  }

  const valueVar = options.enableGradient ? "value" : "color";
  const setterVar = options.enableGradient ? "setValue" : "setColor";

  const props: string[] = [
    `value={${valueVar}}`,
    `onValueChange={${setterVar}}`,
  ];

  if (!options.enableGradient) props.push("enableGradient={false}");
  if (!options.showAlpha) props.push("enableAlpha={false}");
  if (!options.showEyeDropper) props.push("enableEyeDropper={false}");
  if (!options.showSwatches) {
    props.push(`enableSwatches={false}`);
  }
  if (options.variant === "popover" && options.triggerMode === "input") {
    props.push(`triggerMode="input"`);
  }
  if (!options.enableTokens) {
    props.push(`autoTokens={false}`);
  } else if (!options.enableTokenSearch) {
    props.push(`enableTokenSearch={false}`);
  }

  const propsStr = props.map((p) => `      ${p}`).join("\n");
  const allImports = [importLine, ...extraImports].join("\n");

  // When showInput is off, add a comment in the generated code explaining
  // that preset components always render the input and the composable API
  // should be used to omit it.
  const inputComment = !options.showInput
    ? `\n  // Preset components always include the input.\n  // Use the composable API to omit <ColorPickerInput /> entirely.\n`
    : "";

  return `${allImports}${typeLine}

function MyColorPicker() {
  ${stateLine}
${inputComment}
  return (
    <${component}
${propsStr}
    />
  );
}`;
}

function generateComposableCode(options: PlaygroundOptions, style: StyleMode): string {
  const imports: string[] = ["ColorPicker"];

  // Area sub-components
  imports.push("ColorPickerArea", "ColorPickerAreaGradient", "ColorPickerAreaThumb");
  // Hue slider sub-components
  imports.push("ColorPickerHueSlider", "ColorPickerHueSliderTrack", "ColorPickerHueSliderThumb");

  if (options.showAlpha) {
    imports.push("ColorPickerAlphaSlider", "ColorPickerAlphaSliderTrack", "ColorPickerAlphaSliderThumb");
  }
  if (options.showInput) imports.push("ColorPickerInput");
  if (options.showEyeDropper) imports.push("ColorPickerEyeDropper");
  if (options.showSwatches) imports.push("ColorPickerSwatches", "ColorPickerSwatch");
  if (options.enableGradient) {
    imports.push("ColorPickerModeSelector", "ColorPickerModeSelectorItem");
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

  let importLine = `import {\n  ${imports.join(",\n  ")},\n} from "@markoradak/color-picker";`;
  if (style === "css") {
    importLine += `\nimport "@markoradak/color-picker/styles";`;
  }

  let typeLine = "";
  if (options.enableGradient) {
    typeLine = `\nimport type { ColorPickerValue } from "@markoradak/color-picker";\n`;
  }

  let stateLine: string;
  if (options.enableGradient) {
    stateLine = `const [value, setValue] = useState<ColorPickerValue>("#16db89");`;
  } else {
    stateLine = `const [color, setColor] = useState("#16db89");`;
  }

  const valueVar = options.enableGradient ? "value" : "color";
  const setterVar = options.enableGradient ? "setValue" : "setColor";

  if (style === "tailwind") {
    return generateComposableTailwind(options, importLine, typeLine, stateLine, valueVar, setterVar);
  }

  // CSS and Unstyled: clean components, className="..." only for unstyled
  const cls = style === "unstyled" ? ` className="..."` : "";

  const parts: string[] = [];
  if (options.enableGradient) {
    parts.push(`    <ColorPickerModeSelector${cls} />`);
  }
  parts.push(`    <ColorPickerArea${cls} />`);
  parts.push(`    <ColorPickerHueSlider${cls} />`);
  if (options.showAlpha) parts.push(`    <ColorPickerAlphaSlider${cls} />`);
  if (options.showInput) {
    const tokenSearchProp = options.enableTokens && !options.enableTokenSearch ? ` enableTokenSearch={false}` : "";
    parts.push(`    <ColorPickerInput${cls}${tokenSearchProp} />`);
  }
  if (options.showEyeDropper) parts.push(`    <ColorPickerEyeDropper${cls} />`);

  if (options.showSwatches) {
    parts.push(`    <ColorPickerSwatches values={[...]}${cls} />`);
  }

  if (options.enableGradient) {
    parts.push(`    <ColorPickerGradientEditor${cls} />`);
    parts.push(`    <ColorPickerGradientSwatches values={[...]}${cls} />`);
  }

  const innerJsx = parts.join("\n");

  const rootExtraProps = options.enableTokens ? "" : " autoTokens={false}";
  let jsx: string;
  if (options.variant === "popover") {
    const triggerTag = options.triggerMode === "input"
      ? `<ColorPickerInputTrigger${cls} />`
      : `<ColorPickerTrigger${cls} />`;
    jsx = `  <ColorPicker value={${valueVar}} onValueChange={${setterVar}}${rootExtraProps}>
    ${triggerTag}
    <ColorPickerContent${cls}>
${innerJsx}
    </ColorPickerContent>
  </ColorPicker>`;
  } else {
    jsx = `  <ColorPicker value={${valueVar}} onValueChange={${setterVar}}${rootExtraProps}>
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

/** Composable + Tailwind: full shadcn-style code with all classes visible */
function generateComposableTailwind(
  options: PlaygroundOptions,
  importLine: string,
  typeLine: string,
  stateLine: string,
  valueVar: string,
  setterVar: string,
): string {
  const I = "      "; // 6-space indent for inner components
  const parts: string[] = [];

  if (options.enableGradient) {
    parts.push(`${I}<ColorPickerModeSelector className="${tw.modeSelector}">
${I}  {(["solid", "linear", "radial", "conic", "mesh"] as const).map((mode) => (
${I}    <ColorPickerModeSelectorItem key={mode} value={mode} className="${tw.modeSelectorItem}" />
${I}  ))}
${I}</ColorPickerModeSelector>`);
  }

  parts.push(`${I}<ColorPickerArea className="${tw.area}">
${I}  <ColorPickerAreaGradient className="${tw.areaGradient}" />
${I}  <ColorPickerAreaThumb className="${tw.areaThumb}" />
${I}</ColorPickerArea>`);

  parts.push(`${I}<ColorPickerHueSlider className="${tw.hueSlider}">
${I}  <ColorPickerHueSliderTrack className="${tw.hueSliderTrack}" />
${I}  <ColorPickerHueSliderThumb className="${tw.hueSliderThumb}" />
${I}</ColorPickerHueSlider>`);

  if (options.showAlpha) {
    parts.push(`${I}<ColorPickerAlphaSlider className="${tw.alphaSlider}">
${I}  <ColorPickerAlphaSliderTrack className="${tw.alphaSliderTrack}" />
${I}  <ColorPickerAlphaSliderThumb className="${tw.alphaSliderThumb}" />
${I}</ColorPickerAlphaSlider>`);
  }

  if (options.showInput) {
    const tokenSearchProp = options.enableTokens && !options.enableTokenSearch ? `\n${I}  enableTokenSearch={false}` : "";
    parts.push(`${I}<ColorPickerInput
${I}  className="${tw.input}"
${I}  classNames={{
${I}    formatToggle: "${tw.inputFormatToggle}",
${I}    field: "${tw.inputField}",
${I}  }}${tokenSearchProp}
${I}/>`);
  }

  if (options.showEyeDropper) {
    parts.push(`${I}<ColorPickerEyeDropper
${I}  className="${tw.eyeDropper}"
${I}  classNames={{
${I}    icon: "${tw.eyeDropperIcon}",
${I}    spinner: "${tw.eyeDropperSpinner}",
${I}  }}
${I}/>`);
  }

  if (options.showSwatches) {
    parts.push(`${I}<ColorPickerSwatches values={swatches} className="${tw.swatches}">
${I}  {swatches.map((c) => (
${I}    <ColorPickerSwatch key={c} value={c} className="${tw.swatch}" />
${I}  ))}
${I}</ColorPickerSwatches>`);
  }

  if (options.enableGradient) {
    parts.push(`${I}<ColorPickerGradientEditor
${I}  className="${tw.gradientEditor}"
${I}  classNames={{
${I}    preview: "${tw.gradientPreview}",
${I}    stopDot: "${tw.gradientStopDot}",
${I}    baseColor: "${tw.gradientBaseColor}",
${I}    contextMenu: "${tw.gradientContextMenu}",
${I}    contextMenuItem: "${tw.gradientContextMenuItem}",
${I}    popoverContent: "${tw.gradientPopoverContent}",
${I}  }}
${I}/>`);
    parts.push(`${I}<ColorPickerGradientSwatches values={[...]} className="${tw.gradientSwatches}" />`);
  }

  const innerJsx = parts.join("\n");

  let jsx: string;
  if (options.variant === "popover") {
    let trigger: string;
    if (options.triggerMode === "input") {
      trigger = `    <ColorPickerInputTrigger
      className="${tw.inputTrigger}"
      classNames={{
        thumbnail: "${tw.inputTriggerThumbnail}",
        thumbnailCheckerboard: "${tw.inputTriggerThumbnailCheckerboard}",
        thumbnailSwatch: "${tw.inputTriggerThumbnailSwatch}",
        formatToggle: "${tw.inputTriggerFormatToggle}",
        input: "${tw.inputTriggerInput}",
        eyeDropper: "${tw.inputTriggerEyeDropper}",
      }}
    />`;
    } else {
      trigger = `    <ColorPickerTrigger
      className="${tw.trigger}"
      classNames={{
        checkerboard: "${tw.triggerCheckerboard}",
        swatch: "${tw.triggerSwatch}",
      }}
    />`;
    }

    const rootExtraProps = options.enableTokens ? "" : " autoTokens={false}";
    jsx = `  <ColorPicker value={${valueVar}} onValueChange={${setterVar}}${rootExtraProps}>
${trigger}
    <ColorPickerContent
      className="${tw.content}"
    >
${innerJsx}
    </ColorPickerContent>
  </ColorPicker>`;
  } else {
    const rootExtraProps = options.enableTokens ? "" : " autoTokens={false}";
    jsx = `  <ColorPicker value={${valueVar}} onValueChange={${setterVar}}${rootExtraProps}>
${innerJsx}
  </ColorPicker>`;
  }

  const swatchConst = options.showSwatches
    ? `\n  const swatches = ["#ef4444", "#22c55e", "#3b82f6", "#8b5cf6"];\n`
    : "";

  return `${importLine}${typeLine}

function MyColorPicker() {
  ${stateLine}${swatchConst}

  return (
${jsx}
  );
}`;
}

/** Tailwind class strings used in composable code generation */
const tw = {
  content: "z-50 flex w-80 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
  modeSelector: "flex overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800",
  modeSelectorItem: "min-w-0 flex-1 cursor-pointer rounded-md px-1.5 py-1.5 text-center text-xs font-medium outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-emerald-500 data-[active]:bg-white data-[active]:shadow-sm dark:data-[active]:bg-zinc-700 dark:text-zinc-300 dark:data-[active]:text-zinc-100",
  area: "relative h-44 w-full cursor-crosshair rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
  areaGradient: "rounded-lg",
  areaThumb: "h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(0,0,0,0.1)]",
  hueSlider: "relative h-3 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
  hueSliderTrack: "rounded-full",
  hueSliderThumb: "h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",
  alphaSlider: "relative h-3 w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
  alphaSliderTrack: "overflow-hidden rounded-full",
  alphaSliderThumb: "h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",
  input: "flex items-center gap-1",
  inputFormatToggle: "shrink-0 select-none rounded-md border border-zinc-300 bg-white px-2 h-8 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  inputField: "w-full rounded-md border border-zinc-300 bg-white px-2 h-8 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
  eyeDropper: "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-300 bg-white outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  eyeDropperIcon: "h-3.5 w-3.5",
  eyeDropperSpinner: "h-3.5 w-3.5 animate-spin",
  swatches: "gap-1",
  swatch: "relative aspect-square rounded-md border border-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 data-[active]:ring-1 data-[active]:ring-zinc-900 dark:border-zinc-600 dark:data-[active]:ring-zinc-100",
  gradientEditor: "flex flex-col pb-1",
  gradientPreview: "relative aspect-square w-full cursor-crosshair overflow-hidden rounded-lg",
  gradientStopDot: "z-[2] h-3 w-3 cursor-pointer rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] outline-none data-[active]:ring-2 data-[active]:ring-emerald-500",
  gradientBaseColor: "bottom-2 left-2 z-[2] h-5 w-5 cursor-pointer rounded border border-white/50 shadow-sm outline-none",
  gradientContextMenu: "rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
  gradientContextMenuItem: "block w-full px-3 py-1.5 text-left text-xs outline-none hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  gradientPopoverContent: "z-50 flex w-64 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
  gradientSwatches: "mt-0.5 gap-1",
  trigger: "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 p-1 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-600",
  triggerCheckerboard: "inset-1 rounded-md",
  triggerSwatch: "h-full w-full rounded-md",
  inputTrigger: "inline-flex h-10 w-full cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-1.5 text-left outline-none focus-within:ring-2 focus-within:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-900",
  inputTriggerThumbnail: "h-7 w-7 shrink-0 rounded-md",
  inputTriggerThumbnailCheckerboard: "rounded-md",
  inputTriggerThumbnailSwatch: "rounded-md",
  inputTriggerFormatToggle: "shrink-0 cursor-pointer select-none rounded px-1 text-xs font-medium opacity-50 outline-none hover:opacity-80",
  inputTriggerInput: "w-full cursor-text bg-transparent font-mono text-xs outline-none dark:text-zinc-100",
  inputTriggerEyeDropper: "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-60 outline-none hover:opacity-100",
} as const;

export function PlaygroundClient() {
  const { theme } = useTheme();

  const [options, setOptions] = useState<PlaygroundOptions>({
    variant: "inline",
    triggerMode: "input",
    showAlpha: true,
    showEyeDropper: true,
    showSwatches: true,
    showInput: true,
    enableGradient: true,
    enableTokens: true,
    enableTokenSearch: true,
    showContrastInfo: true,
    contrastColor: "#ffffff",
    swatchColors: DEFAULT_SWATCHES,
  });

  // Switch contrast color when theme changes
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      contrastColor: theme === "dark" ? "#000000" : "#ffffff",
    }));
  }, [theme]);

  const [value, setValue] = useState<ColorPickerValue>(DEFAULT_VALUE);
  const [compositionMode, setCompositionMode] = useState<CompositionMode>("preset");
  const [styleMode, setStyleMode] = useState<StyleMode>("tailwind");
  const cssValue = typeof value === "string" ? value : toCSS(value);

  const generatedCode = useMemo(
    () => generateCode(options, compositionMode, styleMode),
    [options, compositionMode, styleMode],
  );

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
                onContrastColorChange={(c) => updateOption("contrastColor", c)}
              />
            ) : (
              <InlinePicker
                value={value}
                onValueChange={setValue}
                options={options}
                onContrastColorChange={(c) => updateOption("contrastColor", c)}
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
            <Toggle
              label="Color tokens"
              description="Named color palette with badge and dropdown"
              checked={options.enableTokens}
              onChange={(v) => updateOption("enableTokens", v)}
            />
            {options.enableTokens && (
              <Toggle
                label="Token search"
                description="Type-to-filter in the token dropdown"
                checked={options.enableTokenSearch}
                onChange={(v) => updateOption("enableTokenSearch", v)}
              />
            )}

            <Toggle
              label="Contrast info"
              description="WCAG contrast ratio against a reference color"
              checked={options.showContrastInfo}
              onChange={(v) => updateOption("showContrastInfo", v)}
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Generated Code
          </h2>
          <div className="flex gap-2">
            <div
              className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
              role="radiogroup"
              aria-label="Composition"
            >
              {(["preset", "composable"] as const).map((mode) => {
                const isActive = compositionMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setCompositionMode(mode)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isActive
                        ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                  >
                    {mode === "preset" ? "Preset" : "Composable"}
                  </button>
                );
              })}
            </div>
            <div
              className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
              role="radiogroup"
              aria-label="Styling"
            >
              {(["tailwind", "css", "unstyled"] as const).map((mode) => {
                const isActive = styleMode === mode;
                const label = mode === "tailwind" ? "Tailwind" : mode === "css" ? "CSS" : "Unstyled";
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setStyleMode(mode)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isActive
                        ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
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
  onContrastColorChange,
}: {
  value: ColorPickerValue;
  onValueChange: (v: ColorPickerValue) => void;
  options: PlaygroundOptions;
  onContrastColorChange: (color: string) => void;
}) {
  const isGradientMode = typeof value !== "string";

  return (
    <div className="w-72">
      <ColorPicker value={value} onValueChange={onValueChange} tokens={options.enableTokens ? DEMO_TOKENS : undefined} autoTokens={options.enableTokens ? undefined : false}>
        <div className="flex flex-col gap-[14.4px]">
          {options.enableGradient && (
            <ColorPickerModeSelector className={styles.modeSelector}>
              {(["solid", "linear", "radial", "conic", "mesh"] as const).map((mode) => (
                <ColorPickerModeSelectorItem key={mode} value={mode} className={styles.modeSelectorItem} />
              ))}
            </ColorPickerModeSelector>
          )}
          {isGradientMode ? (
            <>
              <ColorPickerGradientEditor
                className={styles.gradientEditor}
                classNames={styles.gradientEditorClassNames}
              />
              {options.showSwatches && (
                <ColorPickerGradientSwatches className={styles.gradientSwatches} swatchClassName={styles.gradientSwatch} />
              )}
            </>
          ) : (
            <>
              {options.showContrastInfo && (
                <ColorPickerContrastInfo
                  contrastColor={options.contrastColor}
                  onContrastColorChange={onContrastColorChange}
                  className="flex items-center gap-1.5 text-xs"
                  classNames={{
                    ratio: "font-mono font-medium tabular-nums text-neutral-700 dark:text-neutral-300",
                    badge: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  }}
                />
              )}
              <ColorPickerArea className={styles.area}>
                <ColorPickerAreaGradient className={styles.areaGradient} />
                {options.showContrastInfo && (
                  <ColorPickerContrastLine contrastColor={options.contrastColor} />
                )}
                <ColorPickerAreaThumb className={styles.areaThumb} />
              </ColorPickerArea>
              <ColorPickerHueSlider className={styles.hueSlider}>
                <ColorPickerHueSliderTrack className={styles.hueSliderTrack} />
                <ColorPickerHueSliderThumb className={styles.hueSliderThumb} />
              </ColorPickerHueSlider>
              {options.showAlpha && (
                <ColorPickerAlphaSlider className={styles.alphaSlider}>
                  <ColorPickerAlphaSliderTrack className={styles.alphaSliderTrack} />
                  <ColorPickerAlphaSliderThumb className={styles.alphaSliderThumb} />
                </ColorPickerAlphaSlider>
              )}
              {(options.showInput || options.showEyeDropper) && (
                <div className="flex items-center gap-2">
                  {options.showInput && (
                    <ColorPickerInput className={`${styles.input} flex-1`} classNames={styles.inputClassNames} enableTokenSearch={options.enableTokenSearch} />
                  )}
                  {options.showEyeDropper && (
                    <ColorPickerEyeDropper className={styles.eyeDropper} classNames={styles.eyeDropperClassNames} />
                  )}
                </div>
              )}
              {options.showSwatches && (
                <ColorPickerSwatches values={options.swatchColors} className={styles.swatches}>
                  {options.swatchColors.map((color) => (
                    <ColorPickerSwatch key={color} value={color} className={styles.swatch} />
                  ))}
                </ColorPickerSwatches>
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
  onContrastColorChange,
}: {
  value: ColorPickerValue;
  onValueChange: (v: ColorPickerValue) => void;
  options: PlaygroundOptions;
  onContrastColorChange: (color: string) => void;
}) {
  const isGradientMode = typeof value !== "string";

  return (
    <ColorPicker value={value} onValueChange={onValueChange} tokens={options.enableTokens ? DEMO_TOKENS : undefined} autoTokens={options.enableTokens ? undefined : false}>
      {options.triggerMode === "input" ? (
        <div className="w-72">
          <ColorPickerInputTrigger
            className={styles.inputTrigger}
            classNames={styles.inputTriggerClassNames}
            enableTokenSearch={options.enableTokenSearch}
          />
        </div>
      ) : (
        <ColorPickerTrigger
          className={styles.trigger}
          classNames={styles.triggerClassNames}
        />
      )}
      <ColorPickerContent className={styles.content} style={{ width: "var(--radix-popper-anchor-width)" }}>
        {options.enableGradient && (
          <ColorPickerModeSelector className={styles.modeSelector}>
            {(["solid", "linear", "radial", "conic", "mesh"] as const).map((mode) => (
              <ColorPickerModeSelectorItem key={mode} value={mode} className={styles.modeSelectorItem} />
            ))}
          </ColorPickerModeSelector>
        )}
        {isGradientMode ? (
          <>
            <ColorPickerGradientEditor
              className={styles.gradientEditor}
              classNames={styles.gradientEditorClassNames}
            />
            {options.showSwatches && (
              <ColorPickerGradientSwatches className={styles.gradientSwatches} swatchClassName={styles.gradientSwatch} />
            )}
          </>
        ) : (
          <>
            {options.showContrastInfo && (
              <ColorPickerContrastInfo
                contrastColor={options.contrastColor}
                onContrastColorChange={onContrastColorChange}
                className="flex items-center gap-1.5 text-xs"
                classNames={{
                  ratio: "font-mono font-medium tabular-nums text-neutral-700 dark:text-neutral-300",
                  badge: "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                }}
              />
            )}
            <ColorPickerArea className={styles.area}>
              <ColorPickerAreaGradient className={styles.areaGradient} />
              {options.showContrastInfo && (
                <ColorPickerContrastLine contrastColor={options.contrastColor} />
              )}
              <ColorPickerAreaThumb className={styles.areaThumb} />
            </ColorPickerArea>
            <ColorPickerHueSlider className={styles.hueSlider}>
              <ColorPickerHueSliderTrack className={styles.hueSliderTrack} />
              <ColorPickerHueSliderThumb className={styles.hueSliderThumb} />
            </ColorPickerHueSlider>
            {options.showAlpha && (
              <ColorPickerAlphaSlider className={styles.alphaSlider}>
                <ColorPickerAlphaSliderTrack className={styles.alphaSliderTrack} />
                <ColorPickerAlphaSliderThumb className={styles.alphaSliderThumb} />
              </ColorPickerAlphaSlider>
            )}
            {(options.showInput || options.showEyeDropper) && (
              <div className="flex items-center gap-2">
                {options.showInput && (
                  <ColorPickerInput className={`${styles.input} flex-1`} classNames={styles.inputClassNames} enableTokenSearch={options.enableTokenSearch} />
                )}
                {options.showEyeDropper && (
                  <ColorPickerEyeDropper className={styles.eyeDropper} classNames={styles.eyeDropperClassNames} />
                )}
              </div>
            )}
            {options.showSwatches && (
              <ColorPickerSwatches values={options.swatchColors} className={styles.swatches}>
                {options.swatchColors.map((color) => (
                  <ColorPickerSwatch key={color} value={color} className={styles.swatch} />
                ))}
              </ColorPickerSwatches>
            )}
          </>
        )}
      </ColorPickerContent>
    </ColorPicker>
  );
}
