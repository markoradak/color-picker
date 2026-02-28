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
          "z-50 flex w-64 flex-col gap-3 rounded-xl border p-3",
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
