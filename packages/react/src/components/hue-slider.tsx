import { useCallback, useMemo } from "react";
import type { ColorPickerSliderProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { fromHSVA } from "../utils/color";
import { clamp } from "../utils/position";

const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

/**
 * Horizontal (or vertical) hue slider with a rainbow gradient background.
 * Draggable thumb selects hue from 0 to 360 degrees.
 *
 * Keyboard: left/right arrows (step=1, shift=10).
 */
export function ColorPickerHueSlider({ className, classNames }: ColorPickerSliderProps) {
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
  const thumbColor = useMemo(
    () => fromHSVA({ h: hsva.h, s: 100, v: 100, a: 1 }),
    [hsva.h]
  );

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
      data-cp-part="hue-slider"
      data-disabled={disabled ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={className}
      style={{ position: "relative" }}
    >
      {/* Hue gradient track */}
      <div
        data-cp-el="track"
        className={classNames?.track}
        style={{ position: "absolute", inset: 0, background: HUE_GRADIENT }}
        aria-hidden="true"
      />
      {/* Thumb indicator */}
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
          className={classNames?.thumb}
          style={{ backgroundColor: thumbColor }}
        />
      </div>
    </div>
  );
}
