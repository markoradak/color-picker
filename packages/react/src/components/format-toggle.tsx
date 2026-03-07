import { forwardRef } from "react";
import type { ColorFormat, ColorPickerFormatToggleProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";

const FORMAT_LABELS: Record<ColorFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
};

/**
 * Button that cycles through color formats: HEX -> RGB -> HSL -> HEX.
 * Displays the current format label. Updating the format changes
 * what the Input component displays.
 */
export const ColorPickerFormatToggle = forwardRef<
  HTMLButtonElement,
  ColorPickerFormatToggleProps
>(function ColorPickerFormatToggle({ className, ...rest }, ref) {
  const { format, toggleFormat, disabled } = useColorPickerContext();

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      aria-label={`Color format: ${FORMAT_LABELS[format]}. Click to change.`}
      data-cp-part="format-toggle"
      data-disabled={disabled ? "" : undefined}
      {...rest}
      onClick={(e) => {
        toggleFormat();
        rest.onClick?.(e);
      }}
      className={className}
    >
      {FORMAT_LABELS[format]}
    </button>
  );
});
