import { useCallback, useMemo } from "react";
import type { ColorPickerGradientSwatchesProps, GradientValue } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { toCSS } from "../utils/css";

/**
 * Grid of preset gradient swatch buttons.
 * Clicking a swatch sets the picker value to that gradient.
 *
 * Automatically filters to show only gradients matching the current
 * gradient type (linear, radial, conic, mesh). Pass all gradient
 * presets and the component handles filtering.
 *
 * Reuses the same `cp-swatches` CSS class and button markup as the
 * solid color swatches for a consistent appearance.
 */
export function ColorPickerGradientSwatches({
  gradients,
  columns = 8,
  className,
}: ColorPickerGradientSwatchesProps) {
  const { value, updateValue, disabled } = useColorPickerContext();

  // Current gradient type for filtering
  const currentType =
    typeof value === "object" && value !== null
      ? (value as GradientValue).type
      : null;

  // Filter gradients to match current type
  const filtered = useMemo(
    () =>
      currentType
        ? gradients.filter((g) => g.type === currentType)
        : gradients,
    [gradients, currentType]
  );

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

  if (filtered.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Gradient swatches"
      className={[
        "cp-swatches",
        "grid gap-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {filtered.map((gradient, i) => {
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
              "relative h-6 w-6 rounded-md border outline-none",
              "",
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
