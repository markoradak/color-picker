/**
 * Pre-composed color picker components for common use cases.
 *
 * Import from "@markoradak/color-picker/presets" or from the main entry.
 */

import type { ColorPickerPopoverProps, ColorPickerInlineProps } from "../types";
import { ColorPicker } from "./color-picker";
import { useColorPickerContext } from "./color-picker-context";
import { ColorPickerTrigger } from "./trigger";
import { ColorPickerInputTrigger } from "./input-trigger";
import { ColorPickerContent } from "./content";
import { ColorPickerArea } from "./area";
import { ColorPickerHueSlider } from "./hue-slider";
import { ColorPickerAlphaSlider } from "./alpha-slider";
import { ColorPickerInput } from "./input";
import { ColorPickerFormatToggle } from "./format-toggle";
import { ColorPickerEyeDropper } from "./eye-dropper";
import { ColorPickerSwatches } from "./swatches";
import { ColorPickerGradientEditor } from "./gradient-editor";
import { ColorPickerModeSelector } from "./mode-selector";
import { ColorPickerGradientSwatches } from "./gradient-swatches";

/**
 * Shared inner controls rendered by both popover and inline presets.
 * Conditionally renders each section based on the enable* flags.
 *
 * When `enableGradient` is true, renders:
 * - Mode selector at the top
 * - Solid controls (Area, HueSlider, AlphaSlider, Input) in solid mode
 * - Gradient controls (GradientEditor) in gradient mode
 */
function ColorPickerControls({
  enableAlpha = true,
  enableGradient = false,
  enableModeSelector,
  enableEyeDropper = true,
  enableFormatToggle = true,
  swatches,
  swatchColumns = 8,
  gradientSwatches,
}: {
  enableAlpha?: boolean;
  enableGradient?: boolean;
  enableModeSelector?: boolean;
  enableEyeDropper?: boolean;
  enableFormatToggle?: boolean;
  swatches?: string[];
  swatchColumns?: number;
  gradientSwatches?: import("../types").GradientValue[];
}) {
  const { isGradientMode } = useColorPickerContext();
  const showModeSelector = enableModeSelector ?? enableGradient;

  return (
    <>
      {showModeSelector && <ColorPickerModeSelector />}

      {isGradientMode ? (
        // Gradient mode: show gradient editor (preview, stops with per-stop popovers)
        <>
          <ColorPickerGradientEditor />
          {gradientSwatches && gradientSwatches.length > 0 && (
            <ColorPickerGradientSwatches gradients={gradientSwatches} className="mt-0.5" />
          )}
        </>
      ) : (
        // Solid mode: show standard color picker controls
        <>
          <ColorPickerArea />
          <ColorPickerHueSlider />
          {enableAlpha && <ColorPickerAlphaSlider />}
          <div className="flex items-center gap-2">
            <ColorPickerInput enableFormatToggle={enableFormatToggle} />
            {enableEyeDropper && <ColorPickerEyeDropper />}
          </div>
          {swatches && swatches.length > 0 && (
            <ColorPickerSwatches colors={swatches} columns={swatchColumns} />
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
 * color picker controls: area, hue slider, alpha slider, input, format
 * toggle, eye dropper, swatches, and optionally a gradient editor with
 * unified mode selector.
 *
 * Usage:
 * ```tsx
 * <ColorPickerPopover
 *   value={color}
 *   onValueChange={setColor}
 *   enableAlpha
 *   enableEyeDropper
 *   enableGradient
 *   swatches={["#ff0000", "#00ff00", "#0000ff"]}
 * />
 * ```
 */
export function ColorPickerPopover({
  value,
  onValueChange,
  defaultValue,
  disabled = false,
  enableAlpha = true,
  enableGradient = false,
  enableModeSelector,
  enableEyeDropper = true,
  enableFormatToggle = true,
  swatches,
  swatchColumns = 8,
  gradientSwatches,
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
        />
      );
    }
    return <ColorPickerTrigger />;
  };

  return (
    <ColorPicker
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <div className={className}>
        {renderTrigger()}
      </div>
      <ColorPickerContent side={side} align={align} sideOffset={sideOffset}>
        <ColorPickerControls
          enableAlpha={enableAlpha}
          enableGradient={enableGradient}
          enableModeSelector={enableModeSelector}
          enableEyeDropper={enableEyeDropper}
          enableFormatToggle={enableFormatToggle}
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
 * trigger or popover wrapper. The root ColorPicker still provides
 * context, but the Radix Popover.Root wrapper has no trigger so
 * the popover machinery is inert.
 *
 * Usage:
 * ```tsx
 * <ColorPickerInline
 *   value={color}
 *   onValueChange={setColor}
 *   enableGradient
 * />
 * ```
 */
export function ColorPickerInline({
  value,
  onValueChange,
  defaultValue,
  disabled = false,
  enableAlpha = true,
  enableGradient = false,
  enableModeSelector,
  enableEyeDropper = true,
  enableFormatToggle = true,
  swatches,
  swatchColumns = 8,
  gradientSwatches,
  className,
}: ColorPickerInlineProps) {
  return (
    <ColorPicker
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <div
        className={[
          "cp-inline",
          "flex w-64 flex-col gap-3 rounded-xl border p-3",
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
          swatches={swatches}
          swatchColumns={swatchColumns}
          gradientSwatches={gradientSwatches}
        />
      </div>
    </ColorPicker>
  );
}
