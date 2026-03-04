import { useCallback, useMemo } from "react";
import type { ColorPickerGradientSwatchesProps, GradientValue } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { toCSS } from "../utils/css";

const DEFAULT_GRADIENT_SWATCHES: GradientValue[] = [
  // Linear
  { type: "linear", angle: 135, stops: [{ id: "l1a", color: "#FF512F", position: 0 }, { id: "l1b", color: "#DD2476", position: 100 }] },
  { type: "linear", angle: 90, stops: [{ id: "l2a", color: "#2193B0", position: 0 }, { id: "l2b", color: "#6DD5ED", position: 100 }] },
  { type: "linear", angle: 135, stops: [{ id: "l3a", color: "#5433FF", position: 0 }, { id: "l3b", color: "#20BDFF", position: 50 }, { id: "l3c", color: "#A5FECB", position: 100 }] },
  { type: "linear", angle: 90, stops: [{ id: "l4a", color: "#FF9A9E", position: 0 }, { id: "l4b", color: "#FECFEF", position: 100 }] },
  { type: "linear", angle: 180, stops: [{ id: "l5a", color: "#09203F", position: 0 }, { id: "l5b", color: "#537895", position: 100 }] },
  { type: "linear", angle: 135, stops: [{ id: "l6a", color: "#56AB2F", position: 0 }, { id: "l6b", color: "#A8E063", position: 100 }] },
  { type: "linear", angle: 45, stops: [{ id: "l7a", color: "#614385", position: 0 }, { id: "l7b", color: "#516395", position: 100 }] },
  { type: "linear", angle: 90, stops: [{ id: "l8a", color: "#BDC3C7", position: 0 }, { id: "l8b", color: "#2C3E50", position: 100 }] },
  // Radial
  { type: "radial", stops: [{ id: "r1a", color: "#FFD700", position: 0 }, { id: "r1b", color: "#FF4500", position: 100 }] },
  { type: "radial", stops: [{ id: "r2a", color: "#BF5AE0", position: 0 }, { id: "r2b", color: "#2D0845", position: 100 }] },
  { type: "radial", stops: [{ id: "r3a", color: "#00F5A0", position: 0 }, { id: "r3b", color: "#00408A", position: 100 }] },
  { type: "radial", stops: [{ id: "r4a", color: "#FF758C", position: 0 }, { id: "r4b", color: "#1A0010", position: 100 }] },
  { type: "radial", stops: [{ id: "r5a", color: "#E0F4FF", position: 0 }, { id: "r5b", color: "#1B3A5C", position: 100 }] },
  { type: "radial", stops: [{ id: "r6a", color: "#FFC3A0", position: 0 }, { id: "r6b", color: "#870057", position: 100 }] },
  { type: "radial", stops: [{ id: "r7a", color: "#93F9B9", position: 0 }, { id: "r7b", color: "#1D976C", position: 100 }] },
  { type: "radial", stops: [{ id: "r8a", color: "#485563", position: 0 }, { id: "r8b", color: "#0D0D0D", position: 100 }] },
  // Conic
  { type: "conic", angle: 0, stops: [{ id: "c1a", color: "#ff0000", position: 0 }, { id: "c1b", color: "#ffff00", position: 17 }, { id: "c1c", color: "#00ff00", position: 33 }, { id: "c1d", color: "#00ffff", position: 50 }, { id: "c1e", color: "#0000ff", position: 67 }, { id: "c1f", color: "#ff00ff", position: 83 }, { id: "c1g", color: "#ff0000", position: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "c2a", color: "#F5AF19", position: 0 }, { id: "c2b", color: "#F12711", position: 50 }, { id: "c2c", color: "#F5AF19", position: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "c3a", color: "#FF6B6B", position: 0 }, { id: "c3b", color: "#4ECDC4", position: 25 }, { id: "c3c", color: "#45B7D1", position: 50 }, { id: "c3d", color: "#96E6A1", position: 75 }, { id: "c3e", color: "#FF6B6B", position: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "c4a", color: "#E8E8E8", position: 0 }, { id: "c4b", color: "#7F7F7F", position: 25 }, { id: "c4c", color: "#E8E8E8", position: 50 }, { id: "c4d", color: "#7F7F7F", position: 75 }, { id: "c4e", color: "#E8E8E8", position: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "c5a", color: "#FF00FF", position: 0 }, { id: "c5b", color: "#00FFFF", position: 50 }, { id: "c5c", color: "#FF00FF", position: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "c6a", color: "#2D0845", position: 0 }, { id: "c6b", color: "#614385", position: 25 }, { id: "c6c", color: "#516395", position: 50 }, { id: "c6d", color: "#614385", position: 75 }, { id: "c6e", color: "#2D0845", position: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "c7a", color: "#134E5E", position: 0 }, { id: "c7b", color: "#71B280", position: 50 }, { id: "c7c", color: "#134E5E", position: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "c8a", color: "#FF4E50", position: 0 }, { id: "c8b", color: "#FC913A", position: 25 }, { id: "c8c", color: "#F9D423", position: 50 }, { id: "c8d", color: "#FC913A", position: 75 }, { id: "c8e", color: "#FF4E50", position: 100 }] },
  // Mesh
  { type: "mesh", baseColor: "#FFF5F0", stops: [{ id: "m1a", color: "#FF6B6B", position: 0, x: 20, y: 20 }, { id: "m1b", color: "#FFC371", position: 50, x: 80, y: 30 }, { id: "m1c", color: "#4ECDC4", position: 100, x: 50, y: 80 }] },
  { type: "mesh", baseColor: "#0D0221", stops: [{ id: "m2a", color: "#7B2FBE", position: 0, x: 15, y: 15 }, { id: "m2b", color: "#0652DD", position: 33, x: 85, y: 25 }, { id: "m2c", color: "#E84393", position: 66, x: 25, y: 85 }, { id: "m2d", color: "#00D2D3", position: 100, x: 80, y: 75 }] },
  { type: "mesh", baseColor: "#FFF8E1", stops: [{ id: "m3a", color: "#F9D423", position: 0, x: 10, y: 10 }, { id: "m3b", color: "#FF4E50", position: 50, x: 90, y: 40 }, { id: "m3c", color: "#1B9CFC", position: 100, x: 40, y: 90 }] },
  { type: "mesh", baseColor: "#0A1628", stops: [{ id: "m4a", color: "#A5FECB", position: 0, x: 20, y: 10 }, { id: "m4b", color: "#20BDFF", position: 33, x: 80, y: 20 }, { id: "m4c", color: "#5433FF", position: 66, x: 50, y: 60 }, { id: "m4d", color: "#09203F", position: 100, x: 50, y: 95 }] },
  { type: "mesh", baseColor: "#FFF0F5", stops: [{ id: "m5a", color: "#FFDEE9", position: 0, x: 25, y: 25 }, { id: "m5b", color: "#B5FFFC", position: 50, x: 75, y: 30 }, { id: "m5c", color: "#FFC3A0", position: 100, x: 50, y: 80 }] },
  { type: "mesh", baseColor: "#071A2B", stops: [{ id: "m6a", color: "#0F2027", position: 0, x: 10, y: 10 }, { id: "m6b", color: "#203A43", position: 33, x: 80, y: 20 }, { id: "m6c", color: "#2C5364", position: 66, x: 20, y: 80 }, { id: "m6d", color: "#00B4DB", position: 100, x: 85, y: 85 }] },
  { type: "mesh", baseColor: "#FFFFFF", stops: [{ id: "m7a", color: "#FF00FF", position: 0, x: 15, y: 30 }, { id: "m7b", color: "#00FFFF", position: 33, x: 85, y: 15 }, { id: "m7c", color: "#FFFF00", position: 66, x: 80, y: 85 }, { id: "m7d", color: "#FF6B6B", position: 100, x: 20, y: 80 }] },
  { type: "mesh", baseColor: "#1A0505", stops: [{ id: "m8a", color: "#1A0010", position: 0, x: 15, y: 15 }, { id: "m8b", color: "#FF4500", position: 50, x: 70, y: 40 }, { id: "m8c", color: "#FFD700", position: 100, x: 85, y: 85 }] },
];

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
 *
 * When no `gradients` are provided, a default set of presets is used.
 */
export function ColorPickerGradientSwatches({
  gradients = DEFAULT_GRADIENT_SWATCHES,
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
              "relative aspect-square rounded-md border outline-none",
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
