import { useColorPickerContext } from "./color-picker-context";
import { GradientPreview } from "./gradient-preview";

interface GradientEditorProps {
  className?: string;
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
export function ColorPickerGradientEditor({ className }: GradientEditorProps) {
  const { isGradientMode } = useColorPickerContext();

  if (!isGradientMode) {
    return null;
  }

  return (
    <div
      className={[
        "cp-gradient-editor",
        "flex flex-col pb-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <GradientPreview />
    </div>
  );
}
