/**
 * Pre-composed color picker components for common use cases.
 *
 * Import from "@markoradak/color-picker/presets" or from the main entry.
 *
 * These presets apply Tailwind CSS utility classes to all unstyled primitives.
 * Dark mode uses Tailwind's `dark:` variant (`.dark` class strategy).
 */

import type { ColorPickerPopoverProps, ColorPickerInlineProps, ColorPickerControlsProps } from "../types";
import { ColorPicker } from "./color-picker";
import { useColorPickerContext } from "./color-picker-context";
import { ColorPickerTrigger } from "./trigger";
import { ColorPickerInputTrigger } from "./input-trigger";
import { ColorPickerContent } from "./content";
import { ColorPickerArea, ColorPickerAreaGradient, ColorPickerAreaThumb } from "./area";
import { ColorPickerHueSlider, ColorPickerHueSliderTrack, ColorPickerHueSliderThumb } from "./hue-slider";
import { ColorPickerAlphaSlider, ColorPickerAlphaSliderTrack, ColorPickerAlphaSliderThumb } from "./alpha-slider";
import { ColorPickerInput } from "./input";
import { ColorPickerFormatToggle } from "./format-toggle";
import { ColorPickerEyeDropper } from "./eye-dropper";
import { ColorPickerSwatches, ColorPickerSwatch } from "./swatches";
import { ColorPickerGradientEditor } from "./gradient-editor";
import { ColorPickerModeSelector, ColorPickerModeSelectorItem } from "./mode-selector";
import { ColorPickerGradientSwatches, ColorPickerGradientSwatch } from "./gradient-swatches";

/** Default preset swatches shown when no `swatches` prop is provided. */
const DEFAULT_PRESET_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

/**
 * Shared inner controls rendered by both popover and inline presets.
 * Conditionally renders each section based on the enable* flags.
 *
 * When `enableGradient` is true, renders:
 * - Mode selector at the top
 * - Solid controls (Area, HueSlider, AlphaSlider, Input) in solid mode
 * - Gradient controls (GradientEditor) in gradient mode
 */
export function ColorPickerControls({
  enableAlpha = true,
  enableGradient = true,
  enableModeSelector,
  enableEyeDropper = true,
  enableFormatToggle = true,
  enableTokenSearch = true,
  enableSwatches = true,
  swatches = DEFAULT_PRESET_SWATCHES,
  swatchColumns = 8,
  gradientSwatches,
}: ColorPickerControlsProps) {
  const { isGradientMode } = useColorPickerContext();
  const showModeSelector = enableModeSelector ?? enableGradient;

  return (
    <>
      {showModeSelector && (
        <ColorPickerModeSelector className="flex justify-between overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          {(["solid", "linear", "radial", "conic", "mesh"] as const).map((mode) => (
            <ColorPickerModeSelectorItem
              key={mode}
              value={mode}
              className="cursor-pointer rounded-md px-1.5 py-1.5 text-center text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[active]:bg-white data-[active]:shadow-sm dark:data-[active]:bg-zinc-700 dark:text-zinc-300 dark:data-[active]:text-zinc-100"
            />
          ))}
        </ColorPickerModeSelector>
      )}

      {isGradientMode ? (
        // Gradient mode: show gradient editor (preview, stops with per-stop popovers)
        <>
          <ColorPickerGradientEditor
            className="flex flex-col pb-1"
            classNames={{
              preview: "relative aspect-square w-full cursor-crosshair overflow-hidden rounded-lg",
              stopDot: "z-[2] h-3 w-3 cursor-pointer rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] outline-none data-[active]:ring-2 data-[active]:ring-blue-500",
              baseColor: "bottom-2 left-2 z-[2] h-5 w-5 cursor-pointer rounded border border-white/50 shadow-sm outline-none",
              contextMenu: "rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
              contextMenuItem: "block w-full px-3 py-1.5 text-left text-xs outline-none hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
              popoverContent: "z-50 flex w-64 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
            }}
          />
          {enableSwatches && gradientSwatches && gradientSwatches.length > 0 && (
            <ColorPickerGradientSwatches
              values={gradientSwatches}
              className="mt-0.5 gap-1"
            >
              {gradientSwatches.map((g, i) => (
                <ColorPickerGradientSwatch
                  key={i}
                  value={g}
                  className="relative aspect-square rounded-md border border-zinc-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[active]:ring-1 data-[active]:ring-zinc-900 dark:border-zinc-600 dark:data-[active]:ring-zinc-100"
                />
              ))}
            </ColorPickerGradientSwatches>
          )}
        </>
      ) : (
        // Solid mode: show standard color picker controls
        <>
          <ColorPickerArea className="relative aspect-[3/2] w-full cursor-crosshair rounded-lg outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
            <ColorPickerAreaGradient className="rounded-lg" />
            <ColorPickerAreaThumb className="h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(0,0,0,0.1)]" />
          </ColorPickerArea>
          <ColorPickerHueSlider className="relative h-3 w-full cursor-pointer rounded-full outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
            <ColorPickerHueSliderTrack className="rounded-full" />
            <ColorPickerHueSliderThumb className="h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
          </ColorPickerHueSlider>
          {enableAlpha && (
            <ColorPickerAlphaSlider className="relative h-3 w-full cursor-pointer rounded-full outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
              <ColorPickerAlphaSliderTrack className="overflow-hidden rounded-full" />
              <ColorPickerAlphaSliderThumb className="h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
            </ColorPickerAlphaSlider>
          )}
          <div className="flex items-center gap-2">
            <ColorPickerInput
              enableFormatToggle={enableFormatToggle}
              enableTokenSearch={enableTokenSearch}
              className="flex items-center gap-1"
              classNames={{
                formatToggle: "shrink-0 select-none rounded-md border border-zinc-300 bg-white px-2 h-8 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700",
                field: "w-full rounded-md border border-zinc-300 bg-white px-2 h-8 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
                tokenBadge: "right-2.5 top-1/2 -translate-y-1/2 cursor-pointer outline-none data-[matched]:select-none data-[matched]:rounded-full data-[matched]:border data-[matched]:border-zinc-300 data-[matched]:bg-zinc-100 data-[matched]:px-2 data-[matched]:py-0.5 data-[matched]:text-[10px] data-[matched]:font-medium data-[matched]:leading-none data-[matched]:dark:border-zinc-600 data-[matched]:dark:bg-zinc-700 data-[matched]:dark:text-zinc-100 not-data-[matched]:opacity-60 not-data-[matched]:hover:opacity-100 data-[editing]:not-data-[matched]:opacity-40",
                tokenIcon: "h-3.5 w-3.5",
                tokenList: "max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
                tokenListItem: "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs outline-none hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
                tokenListSwatch: "inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-zinc-200 dark:border-zinc-600",
                tokenListName: "min-w-0 flex-1 truncate",
                tokenListCheck: "h-3 w-3 shrink-0",
              }}
            />
            {enableEyeDropper && (
              <ColorPickerEyeDropper
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-300 bg-white outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                classNames={{ icon: "h-3.5 w-3.5", spinner: "h-3.5 w-3.5 animate-spin" }}
              />
            )}
          </div>
          {enableSwatches && swatches && swatches.length > 0 && (
            <ColorPickerSwatches
              values={swatches}
              columns={swatchColumns}
              className="gap-1"
            >
              {swatches.map((color) => (
                <ColorPickerSwatch
                  key={color}
                  value={color}
                  className="relative aspect-square rounded-md border border-zinc-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[active]:ring-1 data-[active]:ring-zinc-900 dark:border-zinc-600 dark:data-[active]:ring-zinc-100"
                />
              ))}
            </ColorPickerSwatches>
          )}
        </>
      )}
    </>
  );
}

/**
 * Pre-composed popover color picker.
 *
 * Renders a trigger button that opens a popover containing all standard
 * color picker controls.
 */
export function ColorPickerPopover({
  value,
  onValueChange,
  defaultValue,
  disabled = false,
  enableAlpha = true,
  enableGradient = true,
  enableModeSelector,
  enableEyeDropper = true,
  enableFormatToggle = true,
  enableTokenSearch = true,
  enableSwatches = true,
  swatches = DEFAULT_PRESET_SWATCHES,
  swatchColumns = 8,
  gradientSwatches,
  tokens,
  autoTokens,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  trigger,
  triggerMode = "thumbnail",
  className,
}: ColorPickerPopoverProps) {
  const renderTrigger = () => {
    if (trigger) {
      return <ColorPickerTrigger asChild>{trigger}</ColorPickerTrigger>;
    }
    if (triggerMode === "input") {
      return (
        <ColorPickerInputTrigger
          enableFormatToggle={enableFormatToggle}
          enableEyeDropper={enableEyeDropper}
          enableTokenSearch={enableTokenSearch}
          className="inline-flex h-10 w-full cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-1.5 text-left outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-900"
          classNames={{
            thumbnail: "h-7 w-7 shrink-0 rounded-md",
            thumbnailCheckerboard: "rounded-md",
            thumbnailSwatch: "rounded-md",
            formatToggle: "shrink-0 cursor-pointer select-none rounded px-1 text-xs font-medium opacity-50 outline-none hover:opacity-80 disabled:cursor-not-allowed",
            formatLabel: "shrink-0 select-none text-xs font-medium opacity-50",
            input: "w-full cursor-text bg-transparent font-mono text-xs outline-none disabled:cursor-not-allowed dark:text-zinc-100",
            eyeDropper: "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-60 outline-none hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30",
            eyeDropperIcon: "h-3 w-3",
            eyeDropperSpinner: "h-3 w-3 animate-spin",
            tokenBadge: "right-1.5 top-1/2 -translate-y-1/2 cursor-pointer outline-none data-[matched]:select-none data-[matched]:rounded-full data-[matched]:border data-[matched]:border-zinc-300 data-[matched]:bg-zinc-100 data-[matched]:px-1.5 data-[matched]:py-0.5 data-[matched]:text-[10px] data-[matched]:font-medium data-[matched]:leading-none data-[matched]:dark:border-zinc-600 data-[matched]:dark:bg-zinc-700 data-[matched]:dark:text-zinc-100 not-data-[matched]:opacity-60 not-data-[matched]:hover:opacity-100 data-[editing]:opacity-40",
            tokenIcon: "h-3.5 w-3.5",
            gradientDisplay: "min-w-0 flex-1 truncate font-mono text-xs dark:text-zinc-100",
            tokenList: "max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
            tokenListItem: "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs outline-none hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
            tokenListSwatch: "inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-zinc-200 dark:border-zinc-600",
            tokenListName: "min-w-0 flex-1 truncate",
            tokenListCheck: "h-3 w-3 shrink-0",
          }}
        />
      );
    }
    return (
      <ColorPickerTrigger
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 p-1 outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-600"
        classNames={{
          checkerboard: "inset-1 rounded-md",
          swatch: "h-full w-full rounded-md",
        }}
      />
    );
  };

  return (
    <ColorPicker
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
      tokens={tokens}
      autoTokens={autoTokens}
    >
      <div className={className}>
        {renderTrigger()}
      </div>
      <ColorPickerContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50 flex w-80 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
      >
        <ColorPickerControls
          enableAlpha={enableAlpha}
          enableGradient={enableGradient}
          enableModeSelector={enableModeSelector}
          enableEyeDropper={enableEyeDropper}
          enableFormatToggle={enableFormatToggle}
          enableTokenSearch={enableTokenSearch}
          enableSwatches={enableSwatches}
          swatches={swatches}
          swatchColumns={swatchColumns}
          gradientSwatches={gradientSwatches}
        />
      </ColorPickerContent>
    </ColorPicker>
  );
}

/**
 * Pre-composed inline color picker (always visible, no popover).
 *
 * Renders all standard color picker controls directly without a
 * trigger or popover wrapper.
 */
export function ColorPickerInline({
  value,
  onValueChange,
  defaultValue,
  disabled = false,
  enableAlpha = true,
  enableGradient = true,
  enableModeSelector,
  enableEyeDropper = true,
  enableFormatToggle = true,
  enableTokenSearch = true,
  enableSwatches = true,
  swatches = DEFAULT_PRESET_SWATCHES,
  swatchColumns = 8,
  gradientSwatches,
  tokens,
  autoTokens,
  className,
}: ColorPickerInlineProps) {
  return (
    <ColorPicker
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
      tokens={tokens}
      autoTokens={autoTokens}
    >
      <div
        data-cp-part="inline"
        className={[
          "flex w-80 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ColorPickerControls
          enableAlpha={enableAlpha}
          enableGradient={enableGradient}
          enableModeSelector={enableModeSelector}
          enableEyeDropper={enableEyeDropper}
          enableFormatToggle={enableFormatToggle}
          enableTokenSearch={enableTokenSearch}
          enableSwatches={enableSwatches}
          swatches={swatches}
          swatchColumns={swatchColumns}
          gradientSwatches={gradientSwatches}
        />
      </div>
    </ColorPicker>
  );
}
