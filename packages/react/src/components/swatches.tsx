import { useCallback } from "react";
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
}: ColorPickerSwatchesProps) {
  const { hsva, setColorFromString, disabled } = useColorPickerContext();

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
      className={[
        "cp-swatches",
        "flex flex-wrap justify-between gap-y-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
            className={[
              "relative aspect-square rounded-md border outline-none",
              "",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive ? "ring-1" : "",
            ].join(" ")}
            style={{ backgroundColor: color }}
          >
            {isActive && (
              <svg
                className="absolute inset-0 m-auto h-3 w-3"
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
