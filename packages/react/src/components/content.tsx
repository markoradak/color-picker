import { forwardRef, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerContentProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";

/**
 * Content container for the color picker popover.
 * Renders inside a Radix Popover.Portal + Popover.Content
 * with configurable positioning, shadow, border, and enter/exit animations.
 *
 * Automatically prevents focus steal when the input trigger opened the popover,
 * so the inline text input keeps focus.
 */
export const ColorPickerContent = forwardRef<
  HTMLDivElement,
  ColorPickerContentProps
>(function ColorPickerContent(
  { className, side = "bottom", align = "center", sideOffset = 4, onOpenAutoFocus, children, ...props },
  ref
) {
  const { preserveFocusRef } = useColorPickerContext();

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      // If consumer provided a handler, defer to it
      if (onOpenAutoFocus) {
        onOpenAutoFocus(event);
        return;
      }
      // Preserve focus when the input trigger requested it
      if (preserveFocusRef.current) {
        preserveFocusRef.current = false;
        event.preventDefault();
      }
    },
    [onOpenAutoFocus, preserveFocusRef],
  );

  return (
    <Popover.Portal>
      <Popover.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        onOpenAutoFocus={handleOpenAutoFocus}
        className={[
          "cp-content",
          "z-50 flex w-80 flex-col gap-3 rounded-xl border p-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </Popover.Content>
    </Popover.Portal>
  );
});
