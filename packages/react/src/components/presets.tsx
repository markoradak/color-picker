/**
 * Pre-composed color picker components for common use cases.
 *
 * Import from "@markoradak/color-picker/presets" or from the main entry.
 */

import type { ColorPickerPopoverProps, ColorPickerInlineProps } from "../types";
import { ColorPicker } from "./color-picker";
import { ColorPickerTrigger } from "./trigger";
import { ColorPickerContent } from "./content";
import { ColorPickerArea } from "./area";
import { ColorPickerHueSlider } from "./hue-slider";
import { ColorPickerAlphaSlider } from "./alpha-slider";
import { ColorPickerInput } from "./input";
import { ColorPickerFormatToggle } from "./format-toggle";
import { ColorPickerEyeDropper } from "./eye-dropper";
import { ColorPickerSwatches } from "./swatches";
import { ColorPickerGradientEditor } from "./gradient-editor";

/**
 * Shared inner controls rendered by both popover and inline presets.
 * Conditionally renders each section based on the enable* flags.
 */
function ColorPickerControls({
  enableAlpha = true,
  enableGradient = false,
  enableEyeDropper = true,
  enableFormatToggle = true,
  swatches,
  swatchColumns = 8,
}: {
  enableAlpha?: boolean;
  enableGradient?: boolean;
  enableEyeDropper?: boolean;
  enableFormatToggle?: boolean;
  swatches?: string[];
  swatchColumns?: number;
}) {
  return (
    <>
      <ColorPickerArea />
      <ColorPickerHueSlider />
      {enableAlpha && <ColorPickerAlphaSlider />}
      {enableGradient && <ColorPickerGradientEditor />}
      <div className="flex items-center gap-2">
        <ColorPickerInput />
        {enableFormatToggle && <ColorPickerFormatToggle />}
        {enableEyeDropper && <ColorPickerEyeDropper />}
      </div>
      {swatches && swatches.length > 0 && (
        <ColorPickerSwatches colors={swatches} columns={swatchColumns} />
      )}
    </>
  );
}

/**
 * Pre-composed popover color picker.
 *
 * Renders a trigger button that opens a popover containing all standard
 * color picker controls: area, hue slider, alpha slider, input, format
 * toggle, eye dropper, swatches, and optionally a gradient editor.
 *
 * Usage:
 * ```tsx
 * <ColorPickerPopover
 *   value={color}
 *   onValueChange={setColor}
 *   enableAlpha
 *   enableEyeDropper
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
  enableEyeDropper = true,
  enableFormatToggle = true,
  swatches,
  swatchColumns = 8,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  trigger,
  className,
}: ColorPickerPopoverProps) {
  return (
    <ColorPicker
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <div className={className}>
        {trigger ? (
          <ColorPickerTrigger asChild>{trigger}</ColorPickerTrigger>
        ) : (
          <ColorPickerTrigger />
        )}
      </div>
      <ColorPickerContent side={side} align={align} sideOffset={sideOffset}>
        <ColorPickerControls
          enableAlpha={enableAlpha}
          enableGradient={enableGradient}
          enableEyeDropper={enableEyeDropper}
          enableFormatToggle={enableFormatToggle}
          swatches={swatches}
          swatchColumns={swatchColumns}
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
  enableEyeDropper = true,
  enableFormatToggle = true,
  swatches,
  swatchColumns = 8,
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
          "flex w-64 flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ColorPickerControls
          enableAlpha={enableAlpha}
          enableGradient={enableGradient}
          enableEyeDropper={enableEyeDropper}
          enableFormatToggle={enableFormatToggle}
          swatches={swatches}
          swatchColumns={swatchColumns}
        />
      </div>
    </ColorPicker>
  );
}
