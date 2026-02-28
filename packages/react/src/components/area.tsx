import { useCallback } from "react";
import type { ColorPickerAreaProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { fromHSVA } from "../utils/color";
import { clamp } from "../utils/position";

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
 */
export function ColorPickerArea({ className }: ColorPickerAreaProps) {
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

  // Indicator position: s maps to x (0-100%), v maps to y inverted (100-v)%
  const indicatorX = hsva.s;
  const indicatorY = 100 - hsva.v;

  // Current color at the indicator for the dot fill
  const indicatorColor = fromHSVA(hsva);

  return (
    <div
      role="slider"
      aria-label="Color"
      aria-roledescription="2D color picker"
      aria-valuetext={`Saturation ${Math.round(hsva.s)}%, Brightness ${Math.round(hsva.v)}%`}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      data-disabled={disabled ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={[
        "cp-area",
        "relative h-44 w-full cursor-crosshair rounded-lg outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundColor: hueBackground }}
    >
      {/* White-to-transparent horizontal gradient */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background:
            "linear-gradient(to right, #ffffff, transparent)",
        }}
        aria-hidden="true"
      />
      {/* Transparent-to-black vertical gradient */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #000000)",
        }}
        aria-hidden="true"
      />
      {/* Indicator dot */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${indicatorX}%`,
          top: `${indicatorY}%`,
        }}
        aria-hidden="true"
      >
        <div
          className="h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(0,0,0,0.1)]"
          style={{ backgroundColor: indicatorColor }}
        />
      </div>
    </div>
  );
}
