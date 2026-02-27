import { forwardRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerContentProps } from "../types";

/**
 * Content container for the color picker popover.
 * Renders inside a Radix Popover.Portal + Popover.Content
 * with configurable positioning, shadow, border, and enter/exit animations.
 */
export const ColorPickerContent = forwardRef<
  HTMLDivElement,
  ColorPickerContentProps
>(function ColorPickerContent(
  { className, side = "bottom", align = "center", sideOffset = 4, children, ...props },
  ref
) {
  return (
    <Popover.Portal>
      <Popover.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={[
          "cp-content",
          "z-50 flex w-64 flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
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
