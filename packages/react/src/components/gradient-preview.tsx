import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useColorPickerContext } from "./color-picker-context";
import { ColorPickerProvider } from "./color-picker-provider";
import { ColorPickerControls } from "./presets";
import { toCSS } from "../utils/css";
import { interpolateColorAt } from "../utils/gradient";
import { clamp } from "../utils/position";
import type { GradientStop, GradientValue, GradientPreviewProps, MeshGradientStop } from "../types";
import { CHECKERBOARD_STYLE } from "./shared";

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
      return { dx: 1, dy: 0 };
    }
    case "conic": {
      const rad = ((gradient.angle - 90) * Math.PI) / 180;
      return { dx: Math.cos(rad), dy: Math.sin(rad) };
    }
    case "linear": {
      const rad = ((gradient.angle - 90) * Math.PI) / 180;
      return { dx: Math.cos(rad), dy: Math.sin(rad) };
    }
    case "mesh": {
      return { dx: 1, dy: 0 };
    }
  }
}

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

  const cx = gradient.type === "radial" || gradient.type === "conic" ? gradient.centerX : 50;
  const cy = gradient.type === "radial" || gradient.type === "conic" ? gradient.centerY : 50;

  return {
    x: cx + (stop.position / 100) * 50 * dx,
    y: cy + (stop.position / 100) * 50 * dy,
  };
}

function getStopDotPosition(
  stop: GradientStop | MeshGradientStop,
  gradient: GradientValue
): { x: number; y: number } {
  switch (gradient.type) {
    case "linear":
    case "radial":
    case "conic":
      return getLineStopVisual(stop as GradientStop, gradient);
    case "mesh": {
      const meshStop = stop as MeshGradientStop;
      return {
        x: clamp(meshStop.x, 2, 98),
        y: clamp(meshStop.y, 2, 98),
      };
    }
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

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
      const { dx, dy } = getLineDirection(gradient);
      const cx = gradient.centerX;
      const cy = gradient.centerY;
      return round2(clamp(((mx - cx) * dx + (my - cy) * dy) * 2, 0, 100));
    }
    case "mesh":
      return round2(clamp(mx, 0, 100));
  }
}

/**
 * All-in-one gradient editor preview.
 *
 * Renders the gradient as a CSS background on a square element, with
 * absolutely positioned dots for each gradient stop.
 */
export const GradientPreview = forwardRef<
  HTMLDivElement,
  GradientPreviewProps
>(function GradientPreview({ className, classNames, ...rest }, ref) {
  const { gradient: gradientCtx, disabled, swatches } = useColorPickerContext();
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
  const dragListenersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: () => void;
  } | null>(null);
  const [openStopId, setOpenStopId] = useState<string | null>(null);
  const [baseColorOpen, setBaseColorOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const gradientCSS = toCSS(gradientValue);

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

  const handleDotPointerDown = useCallback(
    (stopId: string, e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      draggingStopId.current = stopId;
      didDragRef.current = false;
      setActiveStopId(stopId);

      e.currentTarget.setPointerCapture(e.pointerId);

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
          const oppositeStop = isFirstStop ? lastStop : firstStop;
          anchorPoint = getLineStopVisual(oppositeStop, gradientValue);

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
          const sp = isFirstStop ? { x: mx, y: my } : anchorPoint;
          const ep = isFirstStop ? anchorPoint : { x: mx, y: my };

          const ddx = ep.x - sp.x;
          const ddy = ep.y - sp.y;
          const len = Math.sqrt(ddx * ddx + ddy * ddy);
          const fallbackAngle =
            (gradientValue.type === "linear" || gradientValue.type === "conic")
              ? gradientValue.angle
              : 0;
          const newAngle =
            len > 1
              ? (((Math.atan2(ddy, ddx) * 180) / Math.PI + 90) % 360 + 360) % 360
              : fallbackAngle;

          if (gradientValue.type === "linear") {
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
          } else if (gradientValue.type === "radial") {
            const newStops = gradientValue.stops.map((s) => {
              const t = stopProportions?.get(s.id) ?? 0.5;
              return { ...s, position: round2(t * len * 2) };
            });

            replaceGradient({
              ...gradientValue,
              centerX: round2(sp.x),
              centerY: round2(sp.y),
              startPoint: { x: round2(sp.x), y: round2(sp.y) },
              endPoint: { x: round2(ep.x), y: round2(ep.y) },
              stops: newStops,
            });
          } else if (gradientValue.type === "conic") {
            const newStops = gradientValue.stops.map((s) => {
              const t = stopProportions?.get(s.id) ?? 0.5;
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
          const newPos = positionFromCoords(mx, my, gradientValue);
          updateStopPosition(sid, newPos);
        }
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

  // Clean up drag listeners on unmount to prevent leaks if component unmounts mid-drag
  useEffect(() => {
    return () => {
      if (dragListenersRef.current) {
        document.removeEventListener("pointermove", dragListenersRef.current.move);
        document.removeEventListener("pointerup", dragListenersRef.current.up);
      }
    };
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

  const isMesh = gradientValue.type === "mesh";

  // Line between first and last stops (linear, radial, conic)
  const showGradientLine =
    (gradientValue.type === "linear" || gradientValue.type === "radial" || gradientValue.type === "conic") &&
    gradientValue.stops.length >= 2;

  let gradientLineSVG: React.ReactNode = null;
  if (showGradientLine) {
    const sorted = [...gradientValue.stops].sort((a, b) => a.position - b.position);
    const first = getStopDotPosition(sorted[0]!, gradientValue);
    const last = getStopDotPosition(sorted[sorted.length - 1]!, gradientValue);
    gradientLineSVG = (
      <svg
        data-cp-el="gradient-line"
        style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
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
  }

  return (
    <div
      ref={ref}
      data-cp-part="gradient-preview"
      data-disabled={disabled ? "" : undefined}
      {...rest}
      className={className}
      style={{ position: "relative", ...rest.style }}
    >
      {/* Checkerboard background for alpha visibility */}
      <div
        data-cp-el="checkerboard"
        style={{ position: "absolute", inset: 0, ...CHECKERBOARD_STYLE }}
        aria-hidden="true"
      />
      {/* Gradient background — click to add stop */}
      <div
        ref={previewRef}
        onClick={handlePreviewClick}
        data-cp-el="gradient-bg"
        style={{ position: "absolute", inset: 0, background: gradientCSS }}
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
              data-cp-el="base-color"
              className={classNames?.baseColor}
              style={{ position: "absolute", backgroundColor: gradientValue.baseColor || "#ffffff" }}
            />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              sideOffset={8}
              align="start"
              data-cp-part="content"
              className={classNames?.popoverContent}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <ColorPickerProvider
                value={gradientValue.baseColor || "#ffffff"}
                onValueChange={(color) => setBaseColor(color)}
              >
                <ColorPickerControls swatches={swatches} />
              </ColorPickerProvider>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}

      {/* Line between first and last stops (linear, radial, conic) */}
      {gradientLineSVG}

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
                data-cp-el="stop-dot"
                data-active={isActive ? "" : undefined}
                onPointerDown={(e) => handleDotPointerDown(stop.id, e)}
                onClick={(e) => handleDotClick(stop.id, e)}
                onDoubleClick={(e) => handleDotDoubleClick(stop.id, e)}
                onContextMenu={(e) => handleContextMenu(stop.id, e)}
                onKeyDown={(e) => {
                  if (disabled) return;
                  const step = e.shiftKey ? 10 : 1;
                  const meshStop = stop as MeshGradientStop;
                  switch (e.key) {
                    case "ArrowLeft": {
                      e.preventDefault();
                      if (gradientValue.type === "mesh") {
                        updateStopCoordinates(stop.id, clamp(meshStop.x - step, 0, 100), meshStop.y);
                      } else {
                        updateStopPosition(stop.id, clamp(stop.position - step, 0, 100));
                      }
                      break;
                    }
                    case "ArrowRight": {
                      e.preventDefault();
                      if (gradientValue.type === "mesh") {
                        updateStopCoordinates(stop.id, clamp(meshStop.x + step, 0, 100), meshStop.y);
                      } else {
                        updateStopPosition(stop.id, clamp(stop.position + step, 0, 100));
                      }
                      break;
                    }
                    case "ArrowUp": {
                      if (gradientValue.type === "mesh") {
                        e.preventDefault();
                        updateStopCoordinates(stop.id, meshStop.x, clamp(meshStop.y - step, 0, 100));
                      }
                      break;
                    }
                    case "ArrowDown": {
                      if (gradientValue.type === "mesh") {
                        e.preventDefault();
                        updateStopCoordinates(stop.id, meshStop.x, clamp(meshStop.y + step, 0, 100));
                      }
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
                    case "ContextMenu":
                    case "F10": {
                      if (e.key === "F10" && !e.shiftKey) break;
                      if (gradientValue.type !== "mesh") break;
                      e.preventDefault();
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setContextMenu({ x: rect.left, y: rect.bottom + 4, stopId: stop.id });
                      break;
                    }
                  }
                }}
                disabled={disabled}
                aria-label={`Stop ${stop.color} at ${Math.round(stop.position)}%`}
                className={classNames?.stopDot}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
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
                  <ColorPickerControls swatches={swatches} />
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
          role="menu"
          aria-label="Stop layer order"
          data-cp-el="context-menu"
          className={classNames?.contextMenu}
          style={{
            position: "fixed",
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: "var(--cp-z-index-dropdown, 50)",
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
                role="menuitem"
                disabled={isDisabled}
                data-cp-el="context-menu-item"
                className={classNames?.contextMenuItem}
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
});
