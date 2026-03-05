import { useCallback, useEffect } from "react";
import type { ColorPickerSwatchesProps } from "../types";
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
 * Grid of preset color swatch buttons.
 * Clicking a swatch updates the color in context.
 * The active swatch (matching current color) shows a checkmark indicator.
 *
 * When no `values` are provided, a default palette is used.
 */
export function ColorPickerSwatches({
  values = DEFAULT_SWATCH_COLORS,
  columns = 8,
  className,
  classNames,
}: ColorPickerSwatchesProps) {
  const { hsva, setColorFromString, disabled, setSwatches } = useColorPickerContext();

  // Register swatch values in context so gradient stop popovers can use them
  useEffect(() => {
    setSwatches(values);
  }, [values, setSwatches]);

  const currentColor = fromHSVA(hsva).toLowerCase();

  const handleClick = useCallback(
    (color: string) => {
      if (disabled) return;
      setColorFromString(color);
    },
    [setColorFromString, disabled]
  );

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
      {values.map((color) => {
        const isActive = color.toLowerCase() === currentColor;
        const checkColor = getContrastColor(color);

        return (
          <button
            key={color}
            type="button"
            onClick={() => handleClick(color)}
            disabled={disabled}
            aria-label={`Select color ${color}`}
            aria-pressed={isActive}
            data-cp-el="swatch"
            data-active={isActive ? "" : undefined}
            className={classNames?.swatch}
            style={{ backgroundColor: color }}
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
      })}
    </div>
  );
}
