import { forwardRef, useCallback, useMemo } from "react";
import type { ColorPickerSliderProps, ColorPickerAlphaSliderTrackProps, ColorPickerAlphaSliderThumbProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { fromHSVA } from "../utils/color";
import { clamp } from "../utils/position";
import { CHECKERBOARD_STYLE } from "./shared";

/**
 * Renders the checkerboard + alpha gradient track for the alpha slider.
 */
export const ColorPickerAlphaSliderTrack = forwardRef<
  HTMLDivElement,
  ColorPickerAlphaSliderTrackProps
>(function ColorPickerAlphaSliderTrack({ className, ...rest }, ref) {
  const { hsva } = useColorPickerContext();

  const solidColor = useMemo(
    () => fromHSVA({ h: hsva.h, s: hsva.s, v: hsva.v, a: 1 }),
    [hsva.h, hsva.s, hsva.v]
  );

  const alphaGradient = `linear-gradient(to right, transparent, ${solidColor})`;

  return (
    <>
      {/* Checkerboard background */}
      <div
        ref={ref}
        data-cp-el="checkerboard"
        className={className}
        {...rest}
        style={{ position: "absolute", inset: 0, ...CHECKERBOARD_STYLE, ...rest.style }}
        aria-hidden="true"
      />
      {/* Color gradient overlay */}
      <div
        data-cp-el="track"
        className={className}
        style={{ position: "absolute", inset: 0, background: alphaGradient }}
        aria-hidden="true"
      />
    </>
  );
});

/**
 * Renders the draggable thumb indicator positioned by alpha value.
 */
export const ColorPickerAlphaSliderThumb = forwardRef<
  HTMLDivElement,
  ColorPickerAlphaSliderThumbProps
>(function ColorPickerAlphaSliderThumb({ className, ...rest }, ref) {
  const { hsva } = useColorPickerContext();

  const thumbPosition = hsva.a * 100;
  const thumbColor = useMemo(
    () => fromHSVA(hsva),
    [hsva.h, hsva.s, hsva.v, hsva.a]
  );

  return (
    <div
      ref={ref}
      {...rest}
      style={{
        position: "absolute",
        top: "50%",
        left: `${thumbPosition}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        ...rest.style,
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
});

/**
 * Horizontal alpha/opacity slider with a checkerboard background
 * and a color overlay going from transparent to the current solid color.
 *
 * Keyboard: left/right arrows (step=0.01, shift=0.1).
 *
 * When children are provided, they replace the default track + thumb rendering.
 */
export const ColorPickerAlphaSlider = forwardRef<
  HTMLDivElement,
  ColorPickerSliderProps
>(function ColorPickerAlphaSlider({ className, children, ...rest }, ref) {
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

  return (
    <div
      ref={ref}
      role="slider"
      aria-label="Opacity"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsva.a * 100)}
      aria-valuetext={`${Math.round(hsva.a * 100)}%`}
      tabIndex={disabled ? -1 : 0}
      {...rest}
      onPointerDown={(e) => {
        handlePointerDown(e);
        rest.onPointerDown?.(e);
      }}
      onKeyDown={(e) => {
        handleKeyDown(e);
        rest.onKeyDown?.(e);
      }}
      data-cp-part="alpha-slider"
      data-disabled={disabled ? "" : undefined}
      data-dragging={isDragging ? "" : undefined}
      className={className}
      style={{ position: "relative", ...rest.style }}
    >
      {children ?? (
        <>
          <ColorPickerAlphaSliderTrack />
          <ColorPickerAlphaSliderThumb />
        </>
      )}
    </div>
  );
});
