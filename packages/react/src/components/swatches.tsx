import { useCallback, useEffect } from "react";
import type { ColorPickerSwatchesProps, ColorPickerSwatchProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { fromHSVA, getContrastColor } from "../utils/color";

const DEFAULT_SWATCH_COLORS = [
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
 * Individual color swatch button.
 * Reads context for active state and renders a checkmark when matched.
 */
export function ColorPickerSwatch({ value, className, style }: ColorPickerSwatchProps) {
  const { hsva, setColorFromString, disabled } = useColorPickerContext();
  const currentColor = fromHSVA(hsva).toLowerCase();
  const isActive = value.toLowerCase() === currentColor;
  const checkColor = getContrastColor(value);

  const handleClick = useCallback(() => {
    if (disabled) return;
    setColorFromString(value);
  }, [value, setColorFromString, disabled]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Select color ${value}`}
      aria-pressed={isActive}
      data-cp-el="swatch"
      data-active={isActive ? "" : undefined}
      className={className}
      style={{ ...style, backgroundColor: value }}
    >
      {isActive && (
        <svg
          data-cp-el="check"
          style={{ position: "absolute", inset: 0, margin: "auto" }}
          viewBox="0 0 12 12"
          fill="none"
          stroke={checkColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 6l2.5 2.5 4.5-4.5" />
        </svg>
      )}
    </button>
  );
}

/**
 * Grid of preset color swatch buttons.
 * Clicking a swatch updates the color in context.
 * The active swatch (matching current color) shows a checkmark indicator.
 *
 * When no `values` are provided, a default palette is used.
 *
 * When children are provided, they replace the auto-rendered swatches.
 */
export function ColorPickerSwatches({
  values = DEFAULT_SWATCH_COLORS,
  columns = 8,
  className,
  swatchClassName,
  children,
}: ColorPickerSwatchesProps) {
  const { disabled, setSwatches } = useColorPickerContext();

  // Register swatch values in context so gradient stop popovers can use them
  useEffect(() => {
    setSwatches(values);
  }, [values, setSwatches]);

  return (
    <div
      role="group"
      aria-label="Color swatches"
      data-cp-part="swatches"
      data-disabled={disabled ? "" : undefined}
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {children ?? values.map((color) => (
        <ColorPickerSwatch
          key={color}
          value={color}
          className={swatchClassName}
          style={swatchClassName ? undefined : { width: '100%', aspectRatio: '1 / 1', position: 'relative' }}
        />
      ))}
    </div>
  );
}
