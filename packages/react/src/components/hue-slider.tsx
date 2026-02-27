import { useCallback } from "react";
import type { ColorPickerSliderProps } from "../types";
import { useColorPickerContext } from "./color-picker";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { clamp } from "../utils/position";

const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

/**
 * Horizontal (or vertical) hue slider with a rainbow gradient background.
 * Draggable thumb selects hue from 0 to 360 degrees.
 *
 * Keyboard: left/right arrows (step=1, shift=10).
 */
export function ColorPickerHueSlider({ className }: ColorPickerSliderProps) {
  const { hsva, setHue, disabled } = useColorPickerContext();

  const { isDragging, handlePointerDown } = usePointerDrag({
    onDrag: useCallback(
      (pos: { x: number; y: number }) => {
        if (disabled) return;
        setHue(pos.x * 360);
      },
      [setHue, disabled]
    ),
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      const step = e.shiftKey ? 10 : 1;
      let h = hsva.h;

      switch (e.key) {
        case "ArrowRight":
          h = clamp(h + step, 0, 360);
          break;
        case "ArrowLeft":
          h = clamp(h - step, 0, 360);
          break;
        default:
          return;
      }

      e.preventDefault();
      setHue(h);
    },
    [hsva.h, setHue, disabled]
  );

  const thumbPosition = (hsva.h / 360) * 100;

  return (
    <div
      role="slider"
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hsva.h)}
      aria-valuetext={`${Math.round(hsva.h)} degrees`}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      data-disabled={disabled ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={[
        "cp-hue-slider",
        "relative h-3 w-full cursor-pointer rounded-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ background: HUE_GRADIENT }}
    >
      {/* Thumb indicator */}
      <div
        className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${thumbPosition}%` }}
        aria-hidden="true"
      >
        <div className="h-4 w-4 rounded-full border-2 border-white bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
      </div>
    </div>
  );
}
