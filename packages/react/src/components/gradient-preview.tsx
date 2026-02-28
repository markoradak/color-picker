import { useCallback, useRef } from "react";
import { useColorPickerContext } from "./color-picker-context";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { toCSS } from "../utils/css";
import { interpolateColorAt } from "../utils/gradient";
import { clamp } from "../utils/position";
import type { GradientStop, GradientValue } from "../types";
import { CHECKERBOARD_STYLE } from "./shared";

interface GradientPreviewProps {
  className?: string;
}

/**
 * Compute the visual (x%, y%) position of a stop dot within the preview square.
 * Returns values in 0-100 range for CSS positioning.
 */
function getStopDotPosition(
  stop: GradientStop,
  gradient: GradientValue
): { x: number; y: number } {
  switch (gradient.type) {
    case "linear": {
      // Position along the angle axis, centered in the preview
      const angle = gradient.angle ?? 90;
      const rad = ((angle - 90) * Math.PI) / 180;
      const cx = 50;
      const cy = 50;
      // Map position 0-100 to a line from start to end through center
      const t = (stop.position / 100 - 0.5) * 0.8; // scale to 80% of preview
      return {
        x: clamp(cx + Math.cos(rad) * t * 100, 2, 98),
        y: clamp(cy + Math.sin(rad) * t * 100, 2, 98),
      };
    }
    case "radial": {
      // Stops radiate outward from the center
      const cx = gradient.centerX ?? 50;
      const cy = gradient.centerY ?? 50;
      // Distance from center proportional to stop position
      const dist = (stop.position / 100) * 40; // max 40% of preview from center
      // Default direction: rightward from center
      return {
        x: clamp(cx + dist, 2, 98),
        y: clamp(cy, 2, 98),
      };
    }
    case "conic": {
      // Stops arranged around a circle
      const cx = gradient.centerX ?? 50;
      const cy = gradient.centerY ?? 50;
      const startAngle = gradient.angle ?? 0;
      const stopAngle = startAngle + (stop.position / 100) * 360;
      const rad = ((stopAngle - 90) * Math.PI) / 180;
      const radius = 30; // 30% of preview
      return {
        x: clamp(cx + Math.cos(rad) * radius, 2, 98),
        y: clamp(cy + Math.sin(rad) * radius, 2, 98),
      };
    }
    case "mesh": {
      // Free-form 2D placement using x, y coordinates
      return {
        x: clamp(stop.x ?? 50, 2, 98),
        y: clamp(stop.y ?? 50, 2, 98),
      };
    }
    default:
      return { x: stop.position, y: 50 };
  }
}

/**
 * Visual gradient preview with interactive stop dots.
 *
 * Renders the gradient as a CSS background on a square element, with
 * absolutely positioned dots for each gradient stop. Supports:
 *
 * - Click a stop dot to select it
 * - Drag stop dots to reposition them
 * - Click empty area to add a new stop
 * - Double-click a stop to remove it (minimum 2 enforced)
 * - Handles all gradient types (linear, radial, conic, mesh)
 */
export function GradientPreview({ className }: GradientPreviewProps) {
  const { gradient: gradientCtx, disabled } = useColorPickerContext();
  const {
    gradient: gradientValue,
    activeStopId,
    setActiveStopId,
    addStop,
    addStopWithCoordinates,
    removeStop,
    updateStopPosition,
    updateStopCoordinates,
  } = gradientCtx;

  const previewRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);

  // The CSS background for the gradient
  const gradientCSS = toCSS(gradientValue);

  // Handle click on empty area to add a stop
  const handlePreviewClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if ((e.target as HTMLElement).closest("[data-stop-dot]")) return;

      const el = previewRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);

      if (gradientValue.type === "mesh") {
        // For mesh, add at the clicked x, y position
        const color = interpolateColorAt(gradientValue.stops, 50);
        addStopWithCoordinates(color, 50, x, y);
      } else {
        // For linear/radial/conic, estimate position from x coordinate
        const position = clamp(x, 0, 100);
        const color = interpolateColorAt(gradientValue.stops, position);
        addStop(color, position);
      }
    },
    [disabled, gradientValue.type, gradientValue.stops, addStop, addStopWithCoordinates]
  );

  // Drag handling for stop dots
  const { handlePointerDown: handleDotPointerDown } = usePointerDrag({
    onDrag: useCallback(
      (pos: { x: number; y: number }) => {
        if (disabled || !draggingStopId.current) return;

        if (gradientValue.type === "mesh") {
          // For mesh, update both x and y coordinates
          const x = clamp(pos.x * 100, 0, 100);
          const y = clamp(pos.y * 100, 0, 100);
          updateStopCoordinates(draggingStopId.current, x, y);
        } else {
          // For linear/radial/conic, position maps to the x-axis of the bar
          const position = clamp(pos.x * 100, 0, 100);
          updateStopPosition(draggingStopId.current, position);
        }
      },
      [disabled, gradientValue.type, updateStopPosition, updateStopCoordinates]
    ),
    onDragEnd: useCallback(() => {
      draggingStopId.current = null;
    }, []),
  });

  const handleDotMouseDown = useCallback(
    (stopId: string, e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      draggingStopId.current = stopId;
      setActiveStopId(stopId);
      if (previewRef.current) {
        const syntheticEvent = {
          ...e,
          currentTarget: previewRef.current,
          button: 0,
        } as unknown as React.PointerEvent<HTMLElement>;
        handleDotPointerDown(syntheticEvent);
      }
    },
    [disabled, setActiveStopId, handleDotPointerDown]
  );

  const handleDotDoubleClick = useCallback(
    (stopId: string) => {
      if (disabled) return;
      removeStop(stopId);
    },
    [disabled, removeStop]
  );

  return (
    <div
      className={[
        "cp-gradient-preview",
        "relative aspect-square w-full overflow-hidden rounded-lg",
        disabled ? "cursor-not-allowed opacity-50" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Checkerboard background for alpha visibility */}
      <div
        className="absolute inset-0 rounded-lg"
        style={CHECKERBOARD_STYLE}
        aria-hidden="true"
      />
      {/* Gradient background */}
      <div
        ref={previewRef}
        onClick={handlePreviewClick}
        className="absolute inset-0 cursor-crosshair rounded-lg"
        style={{ background: gradientCSS }}
        role="img"
        aria-label={`${gradientValue.type} gradient preview`}
      />
      {/* Stop dots overlay */}
      {gradientValue.stops.map((stop) => {
        const pos = getStopDotPosition(stop, gradientValue);
        const isActive = stop.id === activeStopId;
        return (
          <button
            key={stop.id}
            type="button"
            data-stop-dot
            onPointerDown={(e) => handleDotMouseDown(stop.id, e)}
            onDoubleClick={() => handleDotDoubleClick(stop.id)}
            disabled={disabled}
            aria-label={`Stop ${stop.color} at ${Math.round(stop.position)}%`}
            className={[
              "absolute -translate-x-1/2 -translate-y-1/2",
              "h-4 w-4 rounded-full border-2 outline-none",
              "focus-visible:ring-2 focus-visible:ring-blue-500",
              isActive
                ? "border-white shadow-[0_0_0_2px_rgba(59,130,246,0.8),0_1px_4px_rgba(0,0,0,0.4)] z-10"
                : "border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.3)]",
              disabled ? "cursor-not-allowed" : "cursor-grab",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              backgroundColor: stop.color,
            }}
          />
        );
      })}
    </div>
  );
}
