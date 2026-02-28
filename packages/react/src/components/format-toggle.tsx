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
      className={[
        "cp-format-toggle",
        "shrink-0 rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700",
        "outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {FORMAT_LABELS[format]}
    </button>
  );
}
