import { useCallback, useRef } from "react";
import { useColorPickerContext } from "./color-picker";
import { usePointerDrag } from "../hooks/use-pointer-drag";
import { interpolateColorAt, sortStops } from "../utils/gradient";
import { clamp } from "../utils/position";

interface GradientStopsProps {
  className?: string;
}

/**
 * Horizontal gradient stop bar.
 *
 * Renders the current gradient as a horizontal bar background with
 * draggable stop markers along the bottom edge. Supports:
 *
 * - Click a stop marker to select it (sets activeStopId)
 * - Drag a stop marker to reposition it (0-100)
 * - Click empty space on the bar to add a new stop (color interpolated from neighbours)
 * - Double-click a stop marker to remove it (minimum 2 stops enforced)
 * - Active stop is highlighted with a ring indicator
 */
export function GradientStops({ className }: GradientStopsProps) {
  const { gradient, disabled } = useColorPickerContext();
  const {
    gradient: gradientValue,
    activeStopId,
    setActiveStopId,
    addStop,
    removeStop,
    updateStopPosition,
  } = gradient;

  const barRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);

  // Build the gradient CSS for the bar background (always render as linear left-to-right)
  const barCSS = (() => {
    const sorted = sortStops(gradientValue.stops);
    const stopsCSS = sorted
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");
    return `linear-gradient(to right, ${stopsCSS})`;
  })();

  // Handle clicking empty space on the bar to add a stop
  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if ((e.target as HTMLElement).closest("[data-stop-id]")) return;

      const bar = barRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const position = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const color = interpolateColorAt(gradientValue.stops, position);
      addStop(color, position);
    },
    [disabled, gradientValue.stops, addStop]
  );

  // Drag handling for stop markers
  const { handlePointerDown: handleStopPointerDown } = usePointerDrag({
    onDrag: useCallback(
      (pos: { x: number }) => {
        if (disabled || !draggingStopId.current) return;
        const position = clamp(pos.x * 100, 0, 100);
        updateStopPosition(draggingStopId.current, position);
      },
      [disabled, updateStopPosition]
    ),
    onDragEnd: useCallback(() => {
      draggingStopId.current = null;
    }, []),
  });

  const handleStopMouseDown = useCallback(
    (stopId: string, e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      draggingStopId.current = stopId;
      setActiveStopId(stopId);
      // Forward the pointer event to the bar element for drag tracking
      if (barRef.current) {
        const syntheticEvent = {
          ...e,
          currentTarget: barRef.current,
          button: 0,
        } as unknown as React.PointerEvent<HTMLElement>;
        handleStopPointerDown(syntheticEvent);
      }
    },
    [disabled, setActiveStopId, handleStopPointerDown]
  );

  const handleStopDoubleClick = useCallback(
    (stopId: string) => {
      if (disabled) return;
      removeStop(stopId);
    },
    [disabled, removeStop]
  );

  return (
    <div
      className={[
        "cp-gradient-stops",
        "relative",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Gradient bar */}
      <div
        ref={barRef}
        onClick={handleBarClick}
        className={[
          "relative h-3 w-full cursor-pointer rounded-full",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ background: barCSS }}
        role="group"
        aria-label="Gradient stops"
      />

      {/* Stop markers */}
      <div className="relative h-5 w-full">
        {gradientValue.stops.map((stop) => {
          const isActive = stop.id === activeStopId;
          return (
            <button
              key={stop.id}
              type="button"
              data-stop-id={stop.id}
              onPointerDown={(e) => handleStopMouseDown(stop.id, e)}
              onDoubleClick={() => handleStopDoubleClick(stop.id)}
              disabled={disabled}
              aria-label={`Gradient stop at ${Math.round(stop.position)}%, color ${stop.color}`}
              aria-pressed={isActive}
              className={[
                "absolute top-0 -translate-x-1/2",
                "h-4 w-4 rounded-full border-2 outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-500",
                isActive
                  ? "border-white shadow-[0_0_0_2px_rgba(59,130,246,0.8),0_1px_3px_rgba(0,0,0,0.3)] z-10"
                  : "border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.2)]",
                disabled ? "cursor-not-allowed" : "cursor-grab",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${stop.position}%`,
                backgroundColor: stop.color,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
