import type { ColorFormat } from "../types";
import { useColorPickerContext } from "./color-picker-context";

interface ColorPickerFormatToggleProps {
  className?: string;
}

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
export function ColorPickerFormatToggle({
  className,
}: ColorPickerFormatToggleProps) {
  const { format, toggleFormat, disabled } = useColorPickerContext();

  return (
    <button
      type="button"
      onClick={toggleFormat}
      disabled={disabled}
      aria-label={`Color format: ${FORMAT_LABELS[format]}. Click to change.`}
      data-cp-part="format-toggle"
      data-disabled={disabled ? "" : undefined}
      className={className}
    >
      {FORMAT_LABELS[format]}
    </button>
  );
}
