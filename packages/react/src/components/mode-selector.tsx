import { forwardRef, useCallback, useRef } from "react";
import type { ColorPickerMode, ColorPickerModeSelectorProps, ColorPickerModeSelectorItemProps, GradientType, GradientValue } from "../types";
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
export const ColorPickerModeSelectorItem = forwardRef<
  HTMLButtonElement,
  ColorPickerModeSelectorItemProps
>(function ColorPickerModeSelectorItem({ value: mode, className, onClick, ...rest }, ref) {
  const { value, hsva, disabled, gradient, updateValue } = useColorPickerContext();
  const activeMode = getActiveMode(value);
  const isActive = mode === activeMode;

  const label = MODES.find((m) => m.value === mode)?.label ?? mode;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (mode !== activeMode) {
        if (mode === "solid") {
          // Gradient -> Solid: extract color from active stop or first stop
          if (isGradient(value as string | GradientValue)) {
            const grad = value as GradientValue;
            const stop = gradient.activeStop ?? grad.stops[0];
            updateValue(stop?.color ?? fromHSVA(hsva));
          }
        } else if (activeMode === "solid") {
          // Solid -> Gradient: create gradient using current color
          const currentColor = fromHSVA(hsva);
          updateValue(createDefaultGradientFromColor(mode, currentColor));
        } else {
          // Gradient A -> Gradient B: change type via gradient hook which handles the discriminated union
          if (isGradient(value as string | GradientValue)) {
            gradient.setGradientType(mode as GradientType);
          }
        }
      }
      onClick?.(e);
    },
    [mode, activeMode, value, hsva, gradient, updateValue, onClick]
  );

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      data-cp-el="mode-button"
      data-active={isActive ? "" : undefined}
      {...rest}
      onClick={handleClick}
      className={className}
    >
      {label}
    </button>
  );
});

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
export const ColorPickerModeSelector = forwardRef<
  HTMLDivElement,
  ColorPickerModeSelectorProps
>(function ColorPickerModeSelector({ className, children, ...rest }, ref) {
  const { disabled } = useColorPickerContext();
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      e.preventDefault();
      const group = groupRef.current;
      if (!group) return;

      const buttons = Array.from(
        group.querySelectorAll<HTMLButtonElement>('[data-cp-el="mode-button"]:not(:disabled)')
      );
      if (buttons.length === 0) return;

      const currentIndex = buttons.findIndex((btn) => btn.getAttribute("tabindex") === "0");
      let nextIndex: number;
      if (e.key === "ArrowRight") {
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      }

      buttons[nextIndex]?.focus();
      buttons[nextIndex]?.click();
    },
    [disabled]
  );

  return (
    <div
      ref={(node) => {
        groupRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-cp-part="mode-selector"
      data-disabled={disabled ? "" : undefined}
      role="radiogroup"
      aria-label="Color picker mode"
      {...rest}
      onKeyDown={(e) => {
        handleKeyDown(e);
        rest.onKeyDown?.(e);
      }}
      className={className}
    >
      {children ?? MODES.map((mode) => (
        <ColorPickerModeSelectorItem key={mode.value} value={mode.value} />
      ))}
    </div>
  );
});
