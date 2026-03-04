import type { ColorPickerMode, ColorPickerModeSelectorProps, GradientValue } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { isGradient } from "../utils/css";
import { createDefaultGradientFromColor } from "../utils/gradient";
import { fromHSVA } from "../utils/color";

const MODES: { value: ColorPickerMode; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
  { value: "conic", label: "Conic" },
  { value: "mesh", label: "Mesh" },
];

/**
 * Derive the active mode from the current picker value.
 */
function getActiveMode(value: unknown): ColorPickerMode {
  if (isGradient(value as string | GradientValue)) {
    return (value as GradientValue).type;
  }
  return "solid";
}

/**
 * Unified mode selector: Solid | Linear | Radial | Conic | Mesh.
 *
 * Handles transitions between solid and gradient modes:
 * - **Solid -> gradient**: Creates a 2-stop gradient from the current color
 * - **Gradient -> solid**: Extracts the active (or first) stop's color
 * - **Gradient A -> B**: Changes the gradient `type`, preserving stops
 */
export function ColorPickerModeSelector({ className }: ColorPickerModeSelectorProps) {
  const { value, hsva, disabled, gradient, updateValue } = useColorPickerContext();
  const activeMode = getActiveMode(value);

  const handleModeChange = (newMode: ColorPickerMode) => {
    if (newMode === activeMode) return;

    if (newMode === "solid") {
      // Gradient -> Solid: extract color from active stop or first stop
      if (isGradient(value as string | GradientValue)) {
        const grad = value as GradientValue;
        const stop = gradient.activeStop ?? grad.stops[0];
        updateValue(stop?.color ?? fromHSVA(hsva));
      }
      return;
    }

    if (activeMode === "solid") {
      // Solid -> Gradient: create gradient using current color
      const currentColor = fromHSVA(hsva);
      updateValue(createDefaultGradientFromColor(newMode, currentColor));
      return;
    }

    // Gradient A -> Gradient B: change type, keep stops
    if (isGradient(value as string | GradientValue)) {
      const grad = value as GradientValue;
      const updated: GradientValue = { ...grad, type: newMode };

      // Add type-specific defaults if switching to a type that needs them
      if (newMode === "linear" || newMode === "conic") {
        updated.angle = updated.angle ?? (newMode === "linear" ? 90 : 0);
      }
      if (newMode === "radial" || newMode === "conic") {
        updated.centerX = updated.centerX ?? 50;
        updated.centerY = updated.centerY ?? 50;
      }

      updateValue(updated);
    }
  };

  return (
    <div
      className={[
        "cp-mode-selector",
        "flex justify-between rounded-lg border p-0.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="radiogroup"
      aria-label="Color picker mode"
    >
      {MODES.map((mode) => {
        const isActive = mode.value === activeMode;
        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => handleModeChange(mode.value)}
            disabled={disabled}
            className={[
              "rounded-md px-1.5 py-1 text-xs font-medium outline-none transition-colors",
              "",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? ""
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
