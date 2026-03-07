import { forwardRef } from "react";
import type { ColorPickerGradientEditorProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";
import { GradientPreview } from "./gradient-preview";

/**
 * Self-contained gradient editing UI.
 *
 * Renders a visual gradient preview that serves as the complete editing
 * interface. All stop manipulation happens directly on the preview:
 *
 * - **Click empty space**: add a new stop
 * - **Click a stop dot**: open a color editing popover
 * - **Drag a stop dot**: reposition/rotate depending on gradient type
 * - **Double-click a stop dot**: remove it
 *
 * The gradient type is selected via the separate `ColorPickerModeSelector`.
 *
 * Only renders content when the current value is a gradient.
 */
export const ColorPickerGradientEditor = forwardRef<
  HTMLDivElement,
  ColorPickerGradientEditorProps
>(function ColorPickerGradientEditor({ className, classNames }, ref) {
  const { isGradientMode } = useColorPickerContext();

  if (!isGradientMode) {
    return null;
  }

  return (
    <div
      ref={ref}
      data-cp-part="gradient-editor"
      className={className}
    >
      <GradientPreview
        className={classNames?.preview}
        classNames={{
          stopDot: classNames?.stopDot,
          baseColor: classNames?.baseColor,
          contextMenu: classNames?.contextMenu,
          contextMenuItem: classNames?.contextMenuItem,
          popoverContent: classNames?.popoverContent,
        }}
      />
    </div>
  );
});
