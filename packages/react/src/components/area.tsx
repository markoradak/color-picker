import { useCallback } from "react";
import type { ColorPickerAreaProps, ColorPickerAreaGradientProps, ColorPickerAreaThumbProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { fromHSVA } from "../utils/color";
import { clamp } from "../utils/position";

/**
 * Renders the white-to-transparent and transparent-to-black overlays
 * that compose the saturation/value gradient.
 */
export function ColorPickerAreaGradient({ className }: ColorPickerAreaGradientProps) {
  return (
    <>
      {/* White-to-transparent horizontal gradient */}
      <div
        data-cp-el="white-overlay"
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, #ffffff, transparent)",
        }}
        aria-hidden="true"
      />
      {/* Transparent-to-black vertical gradient */}
      <div
        data-cp-el="black-overlay"
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, transparent, #000000)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

/**
 * Renders the draggable indicator dot positioned by saturation/value.
 */
export function ColorPickerAreaThumb({ className }: ColorPickerAreaThumbProps) {
  const { hsva } = useColorPickerContext();

  const indicatorX = hsva.s;
  const indicatorY = 100 - hsva.v;
  const indicatorColor = fromHSVA(hsva);

  return (
    <div
      style={{
        position: "absolute",
        left: `${indicatorX}%`,
        top: `${indicatorY}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div
        data-cp-el="thumb"
        className={className}
        style={{ backgroundColor: indicatorColor }}
      />
    </div>
  );
}

/**
 * 2D saturation/value picker area.
 *
 * The background is composed of three layers:
 * 1. Solid hue color (bottom)
 * 2. White-to-transparent horizontal gradient (middle)
 * 3. Transparent-to-black vertical gradient (top)
 *
 * Dragging or clicking positions the indicator and updates
 * the saturation (x-axis, 0-100) and value (y-axis, 100-0) in context.
 *
 * Supports arrow key navigation (step=1, shift+arrow=10).
 *
 * When children are provided, they replace the default gradient + thumb rendering.
 */
export function ColorPickerArea({ className, children }: ColorPickerAreaProps) {
  const { hsva, setSaturationValue, disabled } = useColorPickerContext();

  const { isDragging, handlePointerDown } = usePointerDrag({
    onDrag: useCallback(
      (pos: { x: number; y: number }) => {
        if (disabled) return;
        setSaturationValue(pos.x * 100, (1 - pos.y) * 100);
      },
      [setSaturationValue, disabled]
    ),
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      const step = e.shiftKey ? 10 : 1;
      let { s, v } = hsva;

      switch (e.key) {
        case "ArrowRight":
          s = clamp(s + step, 0, 100);
          break;
        case "ArrowLeft":
          s = clamp(s - step, 0, 100);
          break;
        case "ArrowUp":
          v = clamp(v + step, 0, 100);
          break;
        case "ArrowDown":
          v = clamp(v - step, 0, 100);
          break;
        default:
          return;
      }

      e.preventDefault();
      setSaturationValue(s, v);
    },
    [hsva, setSaturationValue, disabled]
  );

  // Pure hue color for the background (full saturation, full value, no alpha)
  const hueBackground = fromHSVA({ h: hsva.h, s: 100, v: 100, a: 1 });

  return (
    <div
      role="slider"
      aria-label="Color"
      aria-roledescription="2D color picker"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsva.s)}
      aria-valuetext={`Saturation ${Math.round(hsva.s)}%, Brightness ${Math.round(hsva.v)}%`}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      data-cp-part="area"
      data-disabled={disabled ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={className}
      style={{ backgroundColor: hueBackground, position: "relative" }}
    >
      {children ?? (
        <>
          <ColorPickerAreaGradient />
          <ColorPickerAreaThumb />
        </>
      )}
    </div>
  );
}
