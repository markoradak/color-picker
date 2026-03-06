import type { ColorPickerMode, ColorPickerModeSelectorProps, ColorPickerModeSelectorItemProps, GradientValue } from "../types";
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
 * Individual mode selector button.
 * Reads context for active state and handles mode transitions.
 */
export function ColorPickerModeSelectorItem({ value: mode, className }: ColorPickerModeSelectorItemProps) {
  const { value, hsva, disabled, gradient, updateValue } = useColorPickerContext();
  const activeMode = getActiveMode(value);
  const isActive = mode === activeMode;

  const label = MODES.find((m) => m.value === mode)?.label ?? mode;

  const handleClick = () => {
    if (mode === activeMode) return;

    if (mode === "solid") {
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
      updateValue(createDefaultGradientFromColor(mode, currentColor));
      return;
    }

    // Gradient A -> Gradient B: change type, keep stops
    if (isGradient(value as string | GradientValue)) {
      const grad = value as GradientValue;
      const updated: GradientValue = { ...grad, type: mode };

      if (mode === "linear" || mode === "conic") {
        updated.angle = updated.angle ?? (mode === "linear" ? 90 : 0);
      }
      if (mode === "radial" || mode === "conic") {
        updated.centerX = updated.centerX ?? 50;
        updated.centerY = updated.centerY ?? 50;
      }

      updateValue(updated);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={handleClick}
      disabled={disabled}
      data-cp-el="mode-button"
      data-active={isActive ? "" : undefined}
      className={className}
    >
      {label}
    </button>
  );
}

/**
 * Unified mode selector: Solid | Linear | Radial | Conic | Mesh.
 *
 * Handles transitions between solid and gradient modes:
 * - **Solid -> gradient**: Creates a 2-stop gradient from the current color
 * - **Gradient -> solid**: Extracts the active (or first) stop's color
 * - **Gradient A -> B**: Changes the gradient `type`, preserving stops
 *
 * When children are provided, they replace the default mode buttons.
 */
export function ColorPickerModeSelector({ className, children }: ColorPickerModeSelectorProps) {
  const { disabled } = useColorPickerContext();

  return (
    <div
      data-cp-part="mode-selector"
      data-disabled={disabled ? "" : undefined}
      className={className}
      role="radiogroup"
      aria-label="Color picker mode"
    >
      {children ?? MODES.map((mode) => (
        <ColorPickerModeSelectorItem key={mode.value} value={mode.value} />
      ))}
    </div>
  );
}
