import { useCallback } from "react";
import type { ColorPickerSwatchesProps } from "../types";
import { useColorPickerContext } from "./color-picker";
import { fromHSVA, getContrastColor } from "../utils/color";

/**
 * Grid of preset color swatch buttons.
 * Clicking a swatch updates the color in context.
 * The active swatch (matching current color) shows a checkmark indicator.
 */
export function ColorPickerSwatches({
  colors,
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
        "grid gap-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {colors.map((color) => {
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
              "relative h-6 w-6 rounded-md border outline-none",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive ? "border-neutral-800 ring-1 ring-neutral-800" : "border-neutral-300",
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
