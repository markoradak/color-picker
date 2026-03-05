import { forwardRef, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerContentProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";

/**
 * Content container for the color picker popover.
 * Renders inside a Radix Popover.Portal + Popover.Content
 * with configurable positioning.
 *
 * Automatically prevents focus steal when the input trigger opened the popover,
 * so the inline text input keeps focus. Also prevents dismiss when interacting
 * with the Popover.Anchor (input-trigger) so clicks on the input, token badge,
 * format toggle, etc. don't cause close-then-reopen flicker.
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

  const handleInteractOutside = useCallback(
    (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Don't dismiss when the interaction is inside the anchor (input-trigger)
      // or inside a token-list portal. This prevents the close→reopen flicker
      // when clicking the input, token badge, format toggle, eye dropper, etc.
      const inAnchor = target.closest("[data-cp-anchor]");
      const inTokenList = target.closest("[data-cp-token-portal]");
      if (inAnchor || inTokenList) {
        event.preventDefault();
      }
    },
    [],
  );

  return (
    <Popover.Portal>
      <Popover.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        onOpenAutoFocus={handleOpenAutoFocus}
        onInteractOutside={handleInteractOutside}
        data-cp-part="content"
        className={className}
        {...props}
      >
        {children}
      </Popover.Content>
    </Popover.Portal>
  );
});
