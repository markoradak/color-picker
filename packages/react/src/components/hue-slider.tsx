import { forwardRef, useCallback, useMemo } from "react";
import type { ColorPickerSliderProps, ColorPickerHueSliderTrackProps, ColorPickerHueSliderThumbProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { fromHSVA } from "../utils/color";
import { clamp } from "../utils/position";

const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

/**
 * Renders the rainbow gradient track for the hue slider.
 */
export function ColorPickerHueSliderTrack({ className }: ColorPickerHueSliderTrackProps) {
  return (
    <div
      data-cp-el="track"
      className={className}
      style={{ position: "absolute", inset: 0, background: HUE_GRADIENT }}
      aria-hidden="true"
    />
  );
}

/**
 * Renders the draggable thumb indicator positioned by hue value.
 */
export function ColorPickerHueSliderThumb({ className }: ColorPickerHueSliderThumbProps) {
  const { hsva } = useColorPickerContext();

  const thumbPosition = (hsva.h / 360) * 100;
  const thumbColor = useMemo(
    () => fromHSVA({ h: hsva.h, s: 100, v: 100, a: 1 }),
    [hsva.h]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: `${thumbPosition}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div
        data-cp-el="thumb"
        className={className}
        style={{ backgroundColor: thumbColor }}
      />
    </div>
  );
}

/**
 * Horizontal (or vertical) hue slider with a rainbow gradient background.
 * Draggable thumb selects hue from 0 to 360 degrees.
 *
 * Keyboard: left/right arrows (step=1, shift=10).
 *
 * When children are provided, they replace the default track + thumb rendering.
 */
export const ColorPickerHueSlider = forwardRef<
  HTMLDivElement,
  ColorPickerSliderProps
>(function ColorPickerHueSlider({ className, children }, ref) {
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

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hsva.h)}
      aria-valuetext={`${Math.round(hsva.h)} degrees`}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      data-cp-part="hue-slider"
      data-disabled={disabled ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={className}
      style={{ position: "relative" }}
    >
      {children ?? (
        <>
          <ColorPickerHueSliderTrack />
          <ColorPickerHueSliderThumb />
        </>
      )}
    </div>
  );
});
