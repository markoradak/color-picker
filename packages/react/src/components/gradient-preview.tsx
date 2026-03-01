import { useCallback, useEffect, useRef, useState } from "react";
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
import { clamp } from "../utils/position";
import type { GradientStop, GradientValue } from "../types";
import { CHECKERBOARD_STYLE } from "./shared";

interface GradientPreviewProps {
  className?: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  stopId: string;
}

/**
 * Get the gradient direction unit vector for linear, radial, or conic gradients.
 * Uses explicit endpoints if set, otherwise derives from type-specific defaults.
 */
function getLineDirection(gradient: GradientValue): { dx: number; dy: number } {
  if (gradient.startPoint && gradient.endPoint) {
    const ddx = gradient.endPoint.x - gradient.startPoint.x;
    const ddy = gradient.endPoint.y - gradient.startPoint.y;
    const len = Math.sqrt(ddx * ddx + ddy * ddy);
    if (len < 1) return { dx: 1, dy: 0 };
    return { dx: ddx / len, dy: ddy / len };
  }
  switch (gradient.type) {
    case "radial": {
      // Default: horizontal line from center
      return { dx: 1, dy: 0 };
    }
    case "conic": {
      // Default: direction from start angle
      const rad = (((gradient.angle ?? 0) - 90) * Math.PI) / 180;
      return { dx: Math.cos(rad), dy: Math.sin(rad) };
    }
    default: {
      // Linear: direction from angle (default 90°)
      const rad = (((gradient.angle ?? 90) - 90) * Math.PI) / 180;
      return { dx: Math.cos(rad), dy: Math.sin(rad) };
    }
  }
}

/**
 * Compute the unclamped visual position of a gradient stop on the gradient line.
 * Works for linear, radial, and conic gradients.
 *
 * Linear: position 50 = center at (50,50), extends both directions.
 * Radial/Conic: position 0 = center at (centerX,centerY), extends outward.
 * This matches CSS where radial/conic position 0% is at the center.
 */
function getLineStopVisual(
  stop: GradientStop,
  gradient: GradientValue
): { x: number; y: number } {
  const { dx, dy } = getLineDirection(gradient);

  if (gradient.type === "linear") {
    if (gradient.startPoint && gradient.endPoint) {
      const sp = gradient.startPoint;
      const ep = gradient.endPoint;
      const ddx = ep.x - sp.x;
      const ddy = ep.y - sp.y;
      const len = Math.sqrt(ddx * ddx + ddy * ddy);
      if (len < 1) return { x: 50, y: 50 };
      const spProj = 50 + (sp.x - 50) * dx + (sp.y - 50) * dy;
      const t = (stop.position - spProj) / len;
      return { x: sp.x + t * ddx, y: sp.y + t * ddy };
    }
    return {
      x: 50 + (stop.position - 50) * dx,
      y: 50 + (stop.position - 50) * dy,
    };
  }

  // Radial/Conic: position 0 = center, 50 coordinate units = position 100.
  // Same formula for default and endpoint cases — centerX/centerY tracks
  // the center, and getLineDirection provides the correct direction.
  const cx = gradient.centerX ?? 50;
  const cy = gradient.centerY ?? 50;

  return {
    x: cx + (stop.position / 100) * 50 * dx,
    y: cy + (stop.position / 100) * 50 * dy,
  };
}

/**
 * Compute the visual (x%, y%) position of a stop dot within the preview square.
 * Returns values clamped to 2-98 for CSS positioning (keeps dots visible).
 */
function getStopDotPosition(
  stop: GradientStop,
  gradient: GradientValue
): { x: number; y: number } {
  switch (gradient.type) {
    case "linear":
    case "radial":
    case "conic":
      // All three types use the same gradient-line model.
      // No clamping — parent overflow:hidden clips dots at edges.
      return getLineStopVisual(stop, gradient);
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

/** Round to 2 decimal places. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
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
      const { dx, dy } = getLineDirection(gradient);
      return round2(clamp(50 + (mx - 50) * dx + (my - 50) * dy, 0, 100));
    }
    case "radial":
    case "conic": {
      // Position 0 = center, 50 coordinate units = position 100.
      const { dx, dy } = getLineDirection(gradient);
      const cx = gradient.centerX ?? 50;
      const cy = gradient.centerY ?? 50;
      return round2(clamp(((mx - cx) * dx + (my - cy) * dy) * 2, 0, 100));
    }
    default:
      return round2(clamp(mx, 0, 100));
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
 * - **Linear** (endpoints): free 2D drag redefines the gradient line direction
 * - **Linear** (middle): constrained to move along the current axis
 * - **Radial**: distance from center sets stop position
 * - **Conic**: angle around center sets stop position
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
    setBaseColor,
    moveStop,
    replaceGradient,
  } = gradientCtx;

  const previewRef = useRef<HTMLDivElement>(null);
  const draggingStopId = useRef<string | null>(null);
  const didDragRef = useRef(false);
  const [openStopId, setOpenStopId] = useState<string | null>(null);
  const [baseColorOpen, setBaseColorOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

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
   *
   * For linear gradients:
   * - First/last stops are endpoint handles — free 2D drag moves one end of
   *   the gradient line while the opposite end stays fixed (anchor). All other
   *   stops stay at their proportional position along the new line.
   * - Middle stops are axis-locked — only position changes along the line.
   *
   * For radial/conic: all stops project onto the gradient geometry.
   * For mesh: free 2D positioning.
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

      // Determine if this stop is an endpoint (first/last by position).
      // If so, capture the opposite endpoint's visual position as anchor
      // and each stop's proportional position (t) for smooth interpolation.
      let isEndpoint = false;
      let isFirstStop = false;
      let anchorPoint: { x: number; y: number } | null = null;
      let stopProportions: Map<string, number> | null = null;

      if (
        (gradientValue.type === "linear" || gradientValue.type === "radial" || gradientValue.type === "conic") &&
        gradientValue.stops.length >= 2
      ) {
        const sorted = [...gradientValue.stops].sort(
          (a, b) => a.position - b.position
        );
        const firstStop = sorted[0]!;
        const lastStop = sorted[sorted.length - 1]!;
        isFirstStop = firstStop.id === stopId;
        const isLastStop = lastStop.id === stopId;
        isEndpoint = isFirstStop || isLastStop;

        if (isEndpoint) {
          // Use the opposite stop's unclamped visual position as anchor.
          const oppositeStop = isFirstStop ? lastStop : firstStop;
          anchorPoint = getLineStopVisual(oppositeStop, gradientValue);

          // Capture proportional positions so middle stops move with endpoints.
          const range = lastStop.position - firstStop.position;
          if (range > 0) {
            stopProportions = new Map();
            for (const s of gradientValue.stops) {
              stopProportions.set(s.id, (s.position - firstStop.position) / range);
            }
          }
        }
      }

      const handleMove = (ev: PointerEvent) => {
        const coords = getPreviewCoords(ev);
        if (!coords || !draggingStopId.current) return;
        didDragRef.current = true;
        const { mx, my } = coords;
        const sid = draggingStopId.current;

        if (gradientValue.type === "mesh") {
          updateStopCoordinates(sid, clamp(mx, 0, 100), clamp(my, 0, 100));
        } else if (isEndpoint && anchorPoint) {
          // Endpoint: move this end of the line, anchor the opposite end.
          const sp = isFirstStop ? { x: mx, y: my } : anchorPoint;
          const ep = isFirstStop ? anchorPoint : { x: mx, y: my };

          // Derive angle from the line direction
          const ddx = ep.x - sp.x;
          const ddy = ep.y - sp.y;
          const len = Math.sqrt(ddx * ddx + ddy * ddy);
          const newAngle =
            len > 1
              ? (((Math.atan2(ddy, ddx) * 180) / Math.PI + 90) % 360 + 360) % 360
              : gradientValue.angle ?? (gradientValue.type === "linear" ? 90 : 0);

          if (gradientValue.type === "linear") {
            // Linear: interpolate middle stops proportionally along sp→ep,
            // then project onto the new gradient direction.
            const newRad = ((newAngle - 90) * Math.PI) / 180;
            const ndx = Math.cos(newRad);
            const ndy = Math.sin(newRad);

            const newStops = gradientValue.stops.map((s) => {
              const t = stopProportions?.get(s.id) ?? 0.5;
              const vx = sp.x + t * ddx;
              const vy = sp.y + t * ddy;
              const newPos = round2(50 + (vx - 50) * ndx + (vy - 50) * ndy);
              return { ...s, position: newPos };
            });

            replaceGradient({
              ...gradientValue,
              angle: Math.round(newAngle),
              startPoint: { x: round2(sp.x), y: round2(sp.y) },
              endPoint: { x: round2(ep.x), y: round2(ep.y) },
              stops: newStops,
            });
          } else {
            // Radial/Conic: interpolate middle stops proportionally along
            // sp→ep. Position = distance from center * 2 (coordinate-relative).
            const newStops = gradientValue.stops.map((s) => {
              const t = stopProportions?.get(s.id) ?? 0.5;
              // t * len = distance from sp, position = distance * 2
              return { ...s, position: round2(t * len * 2) };
            });

            replaceGradient({
              ...gradientValue,
              angle: Math.round(newAngle),
              centerX: round2(sp.x),
              centerY: round2(sp.y),
              startPoint: { x: round2(sp.x), y: round2(sp.y) },
              endPoint: { x: round2(ep.x), y: round2(ep.y) },
              stops: newStops,
            });
          }
        } else {
          // Middle stop or non-linear: project onto current line/geometry.
          const newPos = positionFromCoords(mx, my, gradientValue);
          updateStopPosition(sid, newPos);
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
      updateStopPosition,
      updateStopCoordinates,
      replaceGradient,
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

  const handleContextMenu = useCallback(
    (stopId: string, e: React.MouseEvent) => {
      if (disabled || gradientValue.type !== "mesh") return;
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, stopId });
    },
    [disabled, gradientValue.type]
  );

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [contextMenu]);

  const isMesh = gradientValue.type === "mesh";

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
      {/* Base color swatch (mesh only) */}
      {isMesh && (
        <Popover.Root open={baseColorOpen} onOpenChange={setBaseColorOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBaseColorOpen((prev) => !prev);
              }}
              disabled={disabled}
              aria-label="Edit base color"
              title="Base color"
              className={[
                "absolute bottom-2 left-2 z-20",
                "h-5 w-5 rounded border-2 border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.3)]",
                disabled ? "cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
              style={{ backgroundColor: gradientValue.baseColor || "#ffffff" }}
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={8}
              align="start"
              className="cp-content z-50 flex w-64 flex-col gap-3 rounded-xl border p-3"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <ColorPickerProvider
                value={gradientValue.baseColor || "#ffffff"}
                onValueChange={(color) => setBaseColor(color)}
              >
                <ColorPickerArea />
                <ColorPickerHueSlider />
                <div className="flex items-center gap-2">
                  <ColorPickerInput />
                  <ColorPickerFormatToggle />
                  <ColorPickerEyeDropper />
                </div>
              </ColorPickerProvider>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}

      {/* Line between first and last stops (linear, radial, conic) */}
      {(gradientValue.type === "linear" || gradientValue.type === "radial" || gradientValue.type === "conic") && gradientValue.stops.length >= 2 && (() => {
        const sorted = [...gradientValue.stops].sort((a, b) => a.position - b.position);
        const first = getStopDotPosition(sorted[0]!, gradientValue);
        const last = getStopDotPosition(sorted[sorted.length - 1]!, gradientValue);
        return (
          <svg
            className="absolute inset-0 z-1 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1={first.x}
              y1={first.y}
              x2={last.x}
              y2={last.y}
              stroke="white"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              strokeOpacity="0.6"
            />
          </svg>
        );
      })()}

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
                onContextMenu={(e) => handleContextMenu(stop.id, e)}
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

      {/* Right-click context menu (mesh only) */}
      {contextMenu && isMesh && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 flex flex-col rounded-lg border py-1 shadow-lg"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: "var(--cp-bg, #ffffff)",
            borderColor: "var(--cp-border, #e5e5e5)",
            minWidth: 160,
          }}
        >
          {([
            { label: "Bring to Front", direction: "front" as const, disabledAt: 0 },
            { label: "Move Forward", direction: "forward" as const, disabledAt: 0 },
            { label: "Move Backward", direction: "backward" as const, disabledAt: gradientValue.stops.length - 1 },
            { label: "Send to Back", direction: "back" as const, disabledAt: gradientValue.stops.length - 1 },
          ]).map((item) => {
            const stopIndex = gradientValue.stops.findIndex((s) => s.id === contextMenu.stopId);
            const isDisabled = stopIndex === item.disabledAt;
            return (
              <button
                key={item.direction}
                type="button"
                disabled={isDisabled}
                className="px-3 py-1.5 text-left text-xs disabled:opacity-30"
                style={{ color: "var(--cp-text, #171717)" }}
                onClick={() => {
                  moveStop(contextMenu.stopId, item.direction);
                  setContextMenu(null);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
