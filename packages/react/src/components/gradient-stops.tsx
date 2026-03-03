import { useCallback, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useColorPickerContext } from "./color-picker-context";
import { ColorPickerProvider } from "./color-picker-provider";
import { ColorPickerArea } from "./area";
import { ColorPickerHueSlider } from "./hue-slider";
import { ColorPickerAlphaSlider } from "./alpha-slider";
import { ColorPickerInput } from "./input";
import { interpolateColorAt, sortStops } from "../utils/gradient";
import { clamp } from "../utils/position";

interface GradientStopsProps {
  className?: string;
}

/**
 * Horizontal gradient stop bar.
 *
 * Renders the current gradient as a horizontal bar background with
 * draggable stop markers along the bottom edge. Each stop marker
 * opens a popover with a mini color picker for editing the stop's color.
 *
 * Supports:
 * - Click a stop marker to open its color editing popover
 * - Drag a stop marker to reposition it (0-100) -- popover stays closed
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
    updateStopColor,
  } = gradient;

  const barRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);
  const didDragRef = useRef(false);
  const [openStopId, setOpenStopId] = useState<string | null>(null);

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

  const handleStopPointerDown = useCallback(
    (stopId: string, e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      draggingStopId.current = stopId;
      didDragRef.current = false;
      setActiveStopId(stopId);

      // Capture on the button itself
      e.currentTarget.setPointerCapture(e.pointerId);

      const handleMove = (ev: PointerEvent) => {
        const bar = barRef.current;
        if (!bar || !draggingStopId.current) return;
        didDragRef.current = true;
        const rect = bar.getBoundingClientRect();
        const position = clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100);
        updateStopPosition(draggingStopId.current, position);
      };

      const handleUp = () => {
        draggingStopId.current = null;
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [disabled, setActiveStopId, updateStopPosition]
  );

  const handleStopClick = useCallback(
    (stopId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      // Only open popover if we didn't drag
      if (!didDragRef.current) {
        setOpenStopId((prev) => (prev === stopId ? null : stopId));
      }
    },
    [disabled]
  );

  const handleStopDoubleClick = useCallback(
    (stopId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      removeStop(stopId);
      if (openStopId === stopId) {
        setOpenStopId(null);
      }
    },
    [disabled, removeStop, openStopId]
  );

  const handleStopColorChange = useCallback(
    (stopId: string, color: string) => {
      updateStopColor(stopId, color);
    },
    [updateStopColor]
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
          const isOpen = openStopId === stop.id;

          return (
            <Popover.Root
              key={stop.id}
              open={isOpen}
              onOpenChange={(open) => {
                if (!open) setOpenStopId(null);
              }}
            >
              <Popover.Trigger asChild>
                <button
                  type="button"
                  data-stop-id={stop.id}
                  onPointerDown={(e) => handleStopPointerDown(stop.id, e)}
                  onClick={(e) => handleStopClick(stop.id, e)}
                  onDoubleClick={(e) => handleStopDoubleClick(stop.id, e)}
                  disabled={disabled}
                  aria-label={`Gradient stop at ${Math.round(stop.position)}%, color ${stop.color}`}
                  aria-pressed={isActive}
                  className={[
                    "absolute top-0 -translate-x-1/2",
                    "h-4 w-4 rounded-full border-2 outline-none",
                    "",
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
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={8}
                  align="center"
                  className="cp-content z-50 w-56 rounded-xl border p-3"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <ColorPickerProvider
                    value={stop.color}
                    onValueChange={(color) => handleStopColorChange(stop.id, color)}
                  >
                    <div className="flex flex-col gap-2">
                      <ColorPickerArea className="!h-32" />
                      <ColorPickerHueSlider />
                      <ColorPickerAlphaSlider />
                      <ColorPickerInput />
                    </div>
                  </ColorPickerProvider>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          );
        })}
      </div>
    </div>
  );
}
