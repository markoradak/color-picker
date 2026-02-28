import { useCallback } from "react";
import { useColorPickerContext } from "./color-picker-context";
import { GradientPreview } from "./gradient-preview";
import { GradientStops } from "./gradient-stops";
import type { GradientValue } from "../types";
import { clamp } from "../utils/position";

interface GradientEditorProps {
  className?: string;
}

/**
 * Self-contained gradient editing UI.
 *
 * Includes angle/center-point controls, a visual gradient preview
 * with interactive stop dots, and a horizontal stop bar with
 * per-stop color editing popovers.
 *
 * The gradient type is selected via the separate `ColorPickerModeSelector`
 * component, which handles Solid/Linear/Radial/Conic/Mesh transitions.
 *
 * Only renders content when the current value is a gradient.
 * If the value is a solid color, renders nothing.
 */
export function ColorPickerGradientEditor({ className }: GradientEditorProps) {
  const { gradient: gradientCtx, isGradientMode, disabled } = useColorPickerContext();

  if (!isGradientMode) {
    return null;
  }

  const {
    gradient: gradientValue,
    setAngle,
    setCenter,
  } = gradientCtx;

  const showAngle = gradientValue.type === "linear" || gradientValue.type === "conic";
  const showCenter = gradientValue.type === "radial" || gradientValue.type === "conic";

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
      {/* Gradient preview */}
      <GradientPreview />

      {/* Gradient stops bar */}
      <GradientStops />

      {/* Controls row */}
      {(showAngle || showCenter) && (
        <div className="flex items-center gap-3">
          {showAngle && (
            <AngleInput
              value={gradientValue.angle ?? (gradientValue.type === "linear" ? 90 : 0)}
              onChange={setAngle}
              disabled={disabled}
            />
          )}
          {showCenter && (
            <CenterPointDisplay
              centerX={gradientValue.centerX ?? 50}
              centerY={gradientValue.centerY ?? 50}
              onChange={setCenter}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function AngleInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (angle: number) => void;
  disabled: boolean;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      if (!isNaN(parsed)) {
        onChange(((parsed % 360) + 360) % 360);
      }
    },
    [onChange]
  );

  return (
    <label className="flex items-center gap-1.5">
      <span className="shrink-0 text-xs text-neutral-500">Angle</span>
      <input
        type="number"
        min={0}
        max={360}
        value={Math.round(value)}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Gradient angle in degrees"
        className={[
          "w-16 rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs tabular-nums",
          "outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      />
      <span className="text-xs text-neutral-400">deg</span>
    </label>
  );
}

function CenterPointDisplay({
  centerX,
  centerY,
  onChange,
  disabled,
}: {
  centerX: number;
  centerY: number;
  onChange: (x: number, y: number) => void;
  disabled: boolean;
}) {
  const handleXChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      if (!isNaN(parsed)) {
        onChange(clamp(parsed, 0, 100), centerY);
      }
    },
    [centerY, onChange]
  );

  const handleYChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      if (!isNaN(parsed)) {
        onChange(centerX, clamp(parsed, 0, 100));
      }
    },
    [centerX, onChange]
  );

  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0 text-xs text-neutral-500">Center</span>
      <input
        type="number"
        min={0}
        max={100}
        value={Math.round(centerX)}
        onChange={handleXChange}
        disabled={disabled}
        aria-label="Center X position"
        className={[
          "w-12 rounded-md border border-neutral-300 bg-white px-1.5 py-1 text-xs tabular-nums",
          "outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      />
      <span className="text-xs text-neutral-400">x</span>
      <input
        type="number"
        min={0}
        max={100}
        value={Math.round(centerY)}
        onChange={handleYChange}
        disabled={disabled}
        aria-label="Center Y position"
        className={[
          "w-12 rounded-md border border-neutral-300 bg-white px-1.5 py-1 text-xs tabular-nums",
          "outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      />
    </div>
  );
}
