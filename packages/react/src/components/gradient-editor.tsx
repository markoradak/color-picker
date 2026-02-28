import { useColorPickerContext } from "./color-picker-context";
import { GradientPreview } from "./gradient-preview";
import { GradientStops } from "./gradient-stops";

interface GradientEditorProps {
  className?: string;
}

/**
 * Self-contained gradient editing UI.
 *
 * Includes a visual gradient preview with interactive stop dots
 * and a horizontal stop bar with per-stop color editing popovers.
 *
 * Angle and center-point are controlled by dragging handles in the preview:
 * - **Linear/Conic**: dragging a handle rotates the gradient, other stops follow
 * - **Radial**: dragging a handle adjusts the center position
 * - **Mesh**: handles move freely in 2D
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
        "flex flex-col gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Gradient preview with draggable stop handles */}
      <GradientPreview />

      {/* Gradient stops bar with per-stop color popovers */}
      <GradientStops />
    </div>
  );
}
