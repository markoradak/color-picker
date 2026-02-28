import { forwardRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerTriggerProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { fromHSVA } from "../utils/color";
import { CHECKERBOARD_STYLE } from "./shared";

/**
 * Trigger button that opens the color picker popover.
 * Displays the current color as a swatch with a checkerboard background
 * for transparent/alpha colors.
 *
 * Supports `asChild` to render as a custom element.
 */
export const ColorPickerTrigger = forwardRef<
  HTMLButtonElement,
  ColorPickerTriggerProps
>(function ColorPickerTrigger({ className, asChild, children, ...props }, ref) {
  const { hsva, disabled } = useColorPickerContext();
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

  return (
    <Popover.Trigger
      ref={ref}
      disabled={disabled}
      aria-label="Open color picker"
      data-disabled={disabled ? "" : undefined}
      className={[
        "cp-trigger",
        "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border p-1",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* Checkerboard background for transparency */}
      <span
        className="absolute inset-1 rounded-md"
        style={CHECKERBOARD_STYLE}
        aria-hidden="true"
      />
      {/* Current color swatch overlay */}
      <span
        className="relative h-full w-full rounded-md"
        style={{ backgroundColor: currentColor }}
        aria-hidden="true"
      />
      {children}
    </Popover.Trigger>
  );
});
