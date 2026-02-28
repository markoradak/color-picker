import { useCallback } from "react";
import type { ColorPickerGradientSwatchesProps, GradientValue } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { toCSS } from "../utils/css";

/**
 * Grid of preset gradient swatch buttons.
 * Clicking a swatch sets the picker value to that gradient.
 */
export function ColorPickerGradientSwatches({
  gradients,
  columns = 4,
  className,
}: ColorPickerGradientSwatchesProps) {
  const { value, updateValue, disabled } = useColorPickerContext();

  const handleClick = useCallback(
    (gradient: GradientValue) => {
      if (disabled) return;
      updateValue(gradient);
    },
    [updateValue, disabled]
  );

  // Check if current value matches a gradient swatch (by type + stop colors)
  const isActive = (gradient: GradientValue): boolean => {
    if (typeof value !== "object" || value === null) return false;
    const current = value as GradientValue;
    if (current.type !== gradient.type) return false;
    if (current.stops.length !== gradient.stops.length) return false;
    return current.stops.every(
      (s, i) =>
        s.color === gradient.stops[i]?.color &&
        Math.abs(s.position - (gradient.stops[i]?.position ?? 0)) < 1
    );
  };

  return (
    <div
      role="group"
      aria-label="Gradient swatches"
      className={[
        "cp-gradient-swatches",
        "grid gap-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {gradients.map((gradient, i) => {
        const css = toCSS(gradient);
        const active = isActive(gradient);

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(gradient)}
            disabled={disabled}
            aria-label={`Select ${gradient.type} gradient`}
            aria-pressed={active}
            className={[
              "relative h-8 w-full rounded-md border outline-none",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active ? "ring-1" : "",
            ].join(" ")}
            style={{ background: css }}
          />
        );
      })}
    </div>
  );
}
