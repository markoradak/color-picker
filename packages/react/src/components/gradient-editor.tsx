import { useCallback } from "react";
import { useColorPickerContext } from "./color-picker";
import { GradientPreview } from "./gradient-preview";
import { GradientStops } from "./gradient-stops";
import type { GradientValue } from "../types";
import { clamp } from "../utils/position";

interface GradientEditorProps {
  className?: string;
}

const GRADIENT_TYPES: { value: GradientValue["type"]; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
  { value: "conic", label: "Conic" },
  { value: "mesh", label: "Mesh" },
];

/**
 * Self-contained gradient editing UI.
 *
 * Includes a gradient type selector, angle/center-point controls,
 * a visual gradient preview with interactive stop dots, and a
 * horizontal stop bar. When a gradient stop is selected, the
 * parent Area / HueSlider / AlphaSlider components automatically
 * edit that stop's color through the context routing system.
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
    setGradientType,
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
      {/* Gradient type selector */}
      <GradientTypeSelector
        value={gradientValue.type}
        onChange={setGradientType}
        disabled={disabled}
      />

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

function GradientTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: GradientValue["type"];
  onChange: (type: GradientValue["type"]) => void;
  disabled: boolean;
}) {
  return (
    <div
      className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5"
      role="radiogroup"
      aria-label="Gradient type"
    >
      {GRADIENT_TYPES.map((gt) => {
        const isActive = gt.value === value;
        return (
          <button
            key={gt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(gt.value)}
            disabled={disabled}
            className={[
              "flex-1 rounded-md px-2 py-1 text-xs font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {gt.label}
          </button>
        );
      })}
    </div>
  );
}

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
