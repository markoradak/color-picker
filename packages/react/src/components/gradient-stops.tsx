import { useCallback, useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useColorPickerContext } from "./color-picker-context";
import { ColorPickerProvider } from "./color-picker-provider";
import { ColorPickerControls } from "./presets";
import { interpolateColorAt, sortStops } from "../utils/gradient";
import { clamp } from "../utils/position";

interface GradientStopsProps {
  className?: string;
  classNames?: {
    bar?: string;
    stopMarker?: string;
    popoverContent?: string;
  };
}

/**
 * Horizontal gradient stop bar.
 *
 * Renders the current gradient as a horizontal bar background with
 * draggable stop markers along the bottom edge. Each stop marker
 * opens a popover with a mini color picker for editing the stop's color.
 */
export function GradientStops({ className, classNames }: GradientStopsProps) {
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
  const dragListenersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: () => void;
  } | null>(null);
  const [openStopId, setOpenStopId] = useState<string | null>(null);

  const barCSS = (() => {
    const sorted = sortStops(gradientValue.stops);
    const stopsCSS = sorted
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");
    return `linear-gradient(to right, ${stopsCSS})`;
  })();

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
        dragListenersRef.current = null;
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
      dragListenersRef.current = { move: handleMove, up: handleUp };
    },
    [disabled, setActiveStopId, updateStopPosition]
  );

  const handleStopClick = useCallback(
    (stopId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
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

  // Clean up drag listeners on unmount to prevent leaks if component unmounts mid-drag
  useEffect(() => {
    return () => {
      if (dragListenersRef.current) {
        document.removeEventListener("pointermove", dragListenersRef.current.move);
        document.removeEventListener("pointerup", dragListenersRef.current.up);
      }
    };
  }, []);

  return (
    <div
      data-cp-part="gradient-stops"
      data-disabled={disabled ? "" : undefined}
      className={className}
      style={{ position: "relative" }}
    >
      {/* Gradient bar */}
      <div
        ref={barRef}
        onClick={handleBarClick}
        data-cp-el="bar"
        className={classNames?.bar}
        style={{ background: barCSS, position: "relative" }}
        role="group"
        aria-label="Gradient stops"
      />

      {/* Stop markers */}
      <div data-cp-el="markers" style={{ position: "relative" }}>
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
                  data-cp-el="stop-marker"
                  data-active={isActive ? "" : undefined}
                  onPointerDown={(e) => handleStopPointerDown(stop.id, e)}
                  onClick={(e) => handleStopClick(stop.id, e)}
                  onDoubleClick={(e) => handleStopDoubleClick(stop.id, e)}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    const step = e.shiftKey ? 10 : 1;
                    switch (e.key) {
                      case "ArrowLeft": {
                        e.preventDefault();
                        updateStopPosition(stop.id, clamp(stop.position - step, 0, 100));
                        break;
                      }
                      case "ArrowRight": {
                        e.preventDefault();
                        updateStopPosition(stop.id, clamp(stop.position + step, 0, 100));
                        break;
                      }
                      case "Delete":
                      case "Backspace": {
                        if (gradientValue.stops.length > 2) {
                          e.preventDefault();
                          removeStop(stop.id);
                        }
                        break;
                      }
                    }
                  }}
                  disabled={disabled}
                  aria-label={`Gradient stop at ${Math.round(stop.position)}%, color ${stop.color}`}
                  aria-pressed={isActive}
                  className={classNames?.stopMarker}
                  style={{
                    position: "absolute",
                    left: `${stop.position}%`,
                    transform: "translateX(-50%)",
                    backgroundColor: stop.color,
                  }}
                />
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  side="top"
                  sideOffset={8}
                  align="center"
                  data-cp-part="content"
                  className={classNames?.popoverContent}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <ColorPickerProvider
                    value={stop.color}
                    onValueChange={(color) => handleStopColorChange(stop.id, color)}
                  >
                    <ColorPickerControls />
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
