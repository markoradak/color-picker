import { useCallback, useMemo } from "react";
import type { ColorPickerSliderProps } from "../types";
import { useColorPickerContext } from "./color-picker";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { fromHSVA } from "../utils/color";
import { clamp } from "../utils/position";
import { CHECKERBOARD_STYLE } from "./shared";

/**
 * Horizontal alpha/opacity slider with a checkerboard background
 * and a color overlay going from transparent to the current solid color.
 *
 * Keyboard: left/right arrows (step=0.01, shift=0.1).
 */
export function ColorPickerAlphaSlider({ className }: ColorPickerSliderProps) {
  const { hsva, setAlpha, disabled } = useColorPickerContext();

  const { isDragging, handlePointerDown } = usePointerDrag({
    onDrag: useCallback(
      (pos: { x: number; y: number }) => {
        if (disabled) return;
        setAlpha(pos.x);
      },
      [setAlpha, disabled]
    ),
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      const step = e.shiftKey ? 0.1 : 0.01;
      let a = hsva.a;

      switch (e.key) {
        case "ArrowRight":
          a = clamp(a + step, 0, 1);
          break;
        case "ArrowLeft":
          a = clamp(a - step, 0, 1);
          break;
        default:
          return;
      }

      e.preventDefault();
      setAlpha(a);
    },
    [hsva.a, setAlpha, disabled]
  );

  // Solid color at full opacity for the gradient overlay
  const solidColor = useMemo(
    () => fromHSVA({ h: hsva.h, s: hsva.s, v: hsva.v, a: 1 }),
    [hsva.h, hsva.s, hsva.v]
  );

  const alphaGradient = `linear-gradient(to right, transparent, ${solidColor})`;
  const thumbPosition = hsva.a * 100;

  return (
    <div
      role="slider"
      aria-label="Opacity"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsva.a * 100)}
      aria-valuetext={`${Math.round(hsva.a * 100)}%`}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      data-disabled={disabled ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={[
        "cp-alpha-slider",
        "relative h-3 w-full cursor-pointer overflow-hidden rounded-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Checkerboard background */}
      <div
        className="absolute inset-0 rounded-full"
        style={CHECKERBOARD_STYLE}
        aria-hidden="true"
      />
      {/* Color gradient overlay */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: alphaGradient }}
        aria-hidden="true"
      />
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
