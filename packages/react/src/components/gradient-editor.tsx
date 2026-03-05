import { useColorPickerContext } from "./color-picker-context";
import { GradientPreview } from "./gradient-preview";

interface GradientEditorProps {
  className?: string;
  classNames?: {
    preview?: string;
    stopDot?: string;
    baseColor?: string;
    contextMenu?: string;
    contextMenuItem?: string;
    popoverContent?: string;
  };
}

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
export function ColorPickerGradientEditor({ className, classNames }: GradientEditorProps) {
  const { isGradientMode } = useColorPickerContext();

  if (!isGradientMode) {
    return null;
  }

  return (
    <div
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
}
