import { useCallback, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useColorPickerContext } from "./color-picker-context";
import { ColorPickerProvider } from "./color-picker-provider";
import { ColorPickerArea } from "./area";
import { ColorPickerHueSlider } from "./hue-slider";
import { ColorPickerAlphaSlider } from "./alpha-slider";
import { ColorPickerInput } from "./input";
import { ColorPickerFormatToggle } from "./format-toggle";
import { ColorPickerEyeDropper } from "./eye-dropper";
import { toCSS } from "../utils/css";
import { interpolateColorAt } from "../utils/gradient";
import { angleFromPosition, clamp } from "../utils/position";
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
      const angle = gradient.angle ?? 90;
      const rad = ((angle - 90) * Math.PI) / 180;
      const cx = 50;
      const cy = 50;
      const t = (stop.position / 100 - 0.5) * 0.8;
      return {
        x: clamp(cx + Math.cos(rad) * t * 100, 2, 98),
        y: clamp(cy + Math.sin(rad) * t * 100, 2, 98),
      };
    }
    case "radial": {
      const cx = gradient.centerX ?? 50;
      const cy = gradient.centerY ?? 50;
      const dist = (stop.position / 100) * 40;
      return {
        x: clamp(cx + dist, 2, 98),
        y: clamp(cy, 2, 98),
      };
    }
    case "conic": {
      const cx = gradient.centerX ?? 50;
      const cy = gradient.centerY ?? 50;
      const startAngle = gradient.angle ?? 0;
      const stopAngle = startAngle + (stop.position / 100) * 360;
      const rad = ((stopAngle - 90) * Math.PI) / 180;
      const radius = 30;
      return {
        x: clamp(cx + Math.cos(rad) * radius, 2, 98),
        y: clamp(cy + Math.sin(rad) * radius, 2, 98),
      };
    }
    case "mesh": {
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
 * Compute a stop position (0-100) from a 2D click coordinate on the preview,
 * based on the gradient type's geometry.
 */
function positionFromCoords(
  mx: number,
  my: number,
  gradient: GradientValue
): number {
  switch (gradient.type) {
    case "linear": {
      const angle = gradient.angle ?? 90;
      const rad = ((angle - 90) * Math.PI) / 180;
      const dx = Math.cos(rad);
      const dy = Math.sin(rad);
      const dot = (mx - 50) * dx + (my - 50) * dy;
      const t = dot / (50 * 0.8);
      return clamp((t + 0.5) * 100, 0, 100);
    }
    case "radial": {
      const cx = gradient.centerX ?? 50;
      const cy = gradient.centerY ?? 50;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      return clamp((dist / 40) * 100, 0, 100);
    }
    case "conic": {
      const cx = gradient.centerX ?? 50;
      const cy = gradient.centerY ?? 50;
      const startAngle = gradient.angle ?? 0;
      const mouseAngle = angleFromPosition(mx, my, cx, cy);
      const relAngle = ((mouseAngle - startAngle) % 360 + 360) % 360;
      return clamp((relAngle / 360) * 100, 0, 100);
    }
    default:
      return clamp(mx, 0, 100);
  }
}

/**
 * All-in-one gradient editor preview.
 *
 * Renders the gradient as a CSS background on a square element, with
 * absolutely positioned dots for each gradient stop.
 *
 * Interactions:
 * - **Click empty space**: add a new stop (color interpolated, position from geometry)
 * - **Click a dot**: open a color editing popover
 * - **Drag a dot**: reposition/rotate depending on gradient type
 * - **Double-click a dot**: remove it (min 2 stops enforced)
 *
 * Drag behavior per gradient type:
 * - **Linear**: rotates the gradient angle; stop positions unchanged
 * - **Radial**: adjusts stop distance from center
 * - **Conic**: rotates the start angle; stop positions unchanged
 * - **Mesh**: free-form 2D positioning
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
    updateStopColor,
    updateStopCoordinates,
    setAngle,
  } = gradientCtx;

  const previewRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);
  const didDragRef = useRef(false);
  const [openStopId, setOpenStopId] = useState<string | null>(null);

  const gradientCSS = toCSS(gradientValue);

  /**
   * Get mouse position in 0-100 coordinates relative to the preview element.
   */
  const getPreviewCoords = useCallback(
    (ev: PointerEvent | React.PointerEvent | React.MouseEvent): { mx: number; my: number } | null => {
      const el = previewRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        mx: clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100),
        my: clamp(((ev.clientY - rect.top) / rect.height) * 100, 0, 100),
      };
    },
    []
  );

  /**
   * Click on empty space in the preview → add a new stop.
   */
  const handlePreviewClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      const coords = getPreviewCoords(e);
      if (!coords) return;
      const { mx, my } = coords;

      if (gradientValue.type === "mesh") {
        const color = interpolateColorAt(gradientValue.stops, 50);
        addStopWithCoordinates(color, 50, mx, my);
      } else {
        const position = positionFromCoords(mx, my, gradientValue);
        const color = interpolateColorAt(gradientValue.stops, position);
        addStop(color, position);
      }
    },
    [disabled, gradientValue, addStop, addStopWithCoordinates, getPreviewCoords]
  );

  /**
   * Pointer down on a dot → start drag tracking.
   */
  const handleDotPointerDown = useCallback(
    (stopId: string, e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      draggingStopId.current = stopId;
      didDragRef.current = false;
      setActiveStopId(stopId);

      e.currentTarget.setPointerCapture(e.pointerId);

      const handleMove = (ev: PointerEvent) => {
        const coords = getPreviewCoords(ev);
        if (!coords || !draggingStopId.current) return;
        didDragRef.current = true;
        const { mx, my } = coords;
        const sid = draggingStopId.current;

        switch (gradientValue.type) {
          case "linear": {
            const newAngle = angleFromPosition(mx, my, 50, 50);
            setAngle(Math.round(newAngle));
            break;
          }
          case "radial": {
            const cx = gradientValue.centerX ?? 50;
            const cy = gradientValue.centerY ?? 50;
            const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
            const newPos = clamp((dist / 40) * 100, 0, 100);
            updateStopPosition(sid, newPos);
            break;
          }
          case "conic": {
            const cx = gradientValue.centerX ?? 50;
            const cy = gradientValue.centerY ?? 50;
            const mouseAngle = angleFromPosition(mx, my, cx, cy);
            const stop = gradientValue.stops.find((s) => s.id === sid);
            if (stop) {
              const newStart =
                ((mouseAngle - (stop.position / 100) * 360) % 360 + 360) % 360;
              setAngle(Math.round(newStart));
            }
            break;
          }
          case "mesh": {
            updateStopCoordinates(sid, clamp(mx, 0, 100), clamp(my, 0, 100));
            break;
          }
        }
      };

      const handleUp = () => {
        draggingStopId.current = null;
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
    },
    [
      disabled,
      gradientValue,
      setActiveStopId,
      setAngle,
      updateStopPosition,
      updateStopCoordinates,
      getPreviewCoords,
    ]
  );

  /**
   * Click on a dot → open color popover (only if we didn't drag).
   */
  const handleDotClick = useCallback(
    (stopId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      if (!didDragRef.current) {
        setOpenStopId((prev) => (prev === stopId ? null : stopId));
      }
    },
    [disabled]
  );

  /**
   * Double-click on a dot → remove it.
   */
  const handleDotDoubleClick = useCallback(
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
      {/* Gradient background — click to add stop */}
      <div
        ref={previewRef}
        onClick={handlePreviewClick}
        className={[
          "absolute inset-0 rounded-lg",
          disabled ? "" : "cursor-crosshair",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ background: gradientCSS }}
        role="img"
        aria-label={`${gradientValue.type} gradient preview`}
      />
      {/* Stop dots with popovers */}
      {gradientValue.stops.map((stop) => {
        const pos = getStopDotPosition(stop, gradientValue);
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
                data-stop-dot
                onPointerDown={(e) => handleDotPointerDown(stop.id, e)}
                onClick={(e) => handleDotClick(stop.id, e)}
                onDoubleClick={(e) => handleDotDoubleClick(stop.id, e)}
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
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side="top"
                sideOffset={8}
                align="center"
                className="cp-content z-50 flex w-64 flex-col gap-3 rounded-xl border p-3"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <ColorPickerProvider
                  value={stop.color}
                  onValueChange={(color) => handleStopColorChange(stop.id, color)}
                >
                  <ColorPickerArea />
                  <ColorPickerHueSlider />
                  <ColorPickerAlphaSlider />
                  <div className="flex items-center gap-2">
                    <ColorPickerInput />
                    <ColorPickerFormatToggle />
                    <ColorPickerEyeDropper />
                  </div>
                </ColorPickerProvider>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        );
      })}
    </div>
  );
}
