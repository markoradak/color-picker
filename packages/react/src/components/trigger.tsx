import { forwardRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerTriggerProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { fromHSVA } from "../utils/color";
import { toCSS } from "../utils/css";
import { CHECKERBOARD_STYLE } from "./shared";

/**
 * Trigger button that opens the color picker popover.
 * Displays the current color as a swatch with a checkerboard background
 * for transparent/alpha colors.
 *
 * In gradient mode, displays the full gradient as the swatch background.
 *
 * Supports `asChild` to render as a custom element.
 */
export const ColorPickerTrigger = forwardRef<
  HTMLButtonElement,
  ColorPickerTriggerProps
>(function ColorPickerTrigger({ className, classNames, asChild, children, ...props }, ref) {
  const { hsva, disabled, isGradientMode, gradient } = useColorPickerContext();
  const currentColor = fromHSVA(hsva);

  if (asChild) {
    return (
      <Popover.Trigger
        ref={ref}
        asChild
        disabled={disabled}
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        {children}
      </Popover.Trigger>
    );
  }

  const swatchStyle = isGradientMode
    ? { background: toCSS(gradient.gradient), position: "relative" as const }
    : { backgroundColor: currentColor, position: "relative" as const };

  return (
    <Popover.Trigger
      ref={ref}
      disabled={disabled}
      aria-label="Open color picker"
      data-cp-part="trigger"
      data-disabled={disabled ? "" : undefined}
      className={className}
      {...props}
    >
      {/* Checkerboard background for transparency */}
      <span
        data-cp-el="checkerboard"
        className={classNames?.checkerboard}
        style={{ ...CHECKERBOARD_STYLE, position: "absolute" }}
        aria-hidden="true"
      />
      {/* Current color swatch overlay */}
      <span
        data-cp-el="swatch"
        className={classNames?.swatch}
        style={swatchStyle}
        aria-hidden="true"
      />
      {children}
    </Popover.Trigger>
  );
});
