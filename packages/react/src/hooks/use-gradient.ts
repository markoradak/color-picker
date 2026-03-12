import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GradientStop, GradientValue, MeshGradientStop } from "../types";
import { colord } from "../utils/color";
import {
  addStop,
  addStopWithCoordinates,
  createDefaultGradient,
  createGradientStop,
  interpolateColorAt,
  moveStop as moveStopUtil,
  removeStop,
  sortStops,
  updateStop,
} from "../utils/gradient";

/** Default 2D positions for mesh gradient stops (spread across the preview area). */
const DEFAULT_MESH_XY: { x: number; y: number }[] = [
  { x: 25, y: 25 },
  { x: 65, y: 80 },
  { x: 80, y: 50 },
  { x: 25, y: 75 },
  { x: 50, y: 25 },
];

/**
 * Strip mesh x/y fields, redistribute positions evenly across 0-100,
 * and composite semi-transparent stops against the base color.
 *
 * Mesh stops often use transparency for the radial blob effect. When converting
 * to a 1D gradient, we blend each stop with the base color to match the visual
 * appearance. If the base color is itself transparent (or absent), the stop's
 * original transparent value is kept as-is.
 */
function meshStopsToGradientStops(meshStops: MeshGradientStop[], baseColor?: string): GradientStop[] {
  const base = baseColor ? colord(baseColor) : null;
  const baseIsOpaque = base !== null && base.alpha() > 0;

  return meshStops.map(({ x: _x, y: _y, ...rest }, i, arr) => {
    const c = colord(rest.color);
    let color = rest.color;

    if (c.alpha() < 1) {
      if (baseIsOpaque) {
        // Composite: mix stop color (at full opacity) with base, weighted by stop alpha
        color = base!.mix(colord(rest.color).alpha(1), c.alpha()).toHex();
      }
      // else: base is transparent/absent — keep original transparent value
    }

    return {
      ...rest,
      color,
      position: arr.length <= 1 ? 0 : Math.round((i / (arr.length - 1)) * 100),
    };
  });
}

/**
 * Construct a new GradientValue with a different type, preserving compatible fields.
 * Required fields for each type are provided with sensible defaults when missing.
 */
function changeGradientType(current: GradientValue, newType: GradientValue["type"]): GradientValue {
  switch (newType) {
    case "linear":
      return {
        type: "linear",
        stops: current.type === "mesh"
          ? meshStopsToGradientStops(current.stops, current.baseColor)
          : current.stops,
        angle: (current.type === "linear" || current.type === "conic") ? current.angle : 90,
      };
    case "radial":
      return {
        type: "radial",
        stops: current.type === "mesh"
          ? meshStopsToGradientStops(current.stops, current.baseColor)
          : current.stops,
        centerX: (current.type === "radial" || current.type === "conic") ? current.centerX : 50,
        centerY: (current.type === "radial" || current.type === "conic") ? current.centerY : 50,
      };
    case "conic":
      return {
        type: "conic",
        stops: current.type === "mesh"
          ? meshStopsToGradientStops(current.stops, current.baseColor)
          : current.stops,
        angle: (current.type === "linear" || current.type === "conic") ? current.angle : 0,
        centerX: (current.type === "radial" || current.type === "conic") ? current.centerX : 50,
        centerY: (current.type === "radial" || current.type === "conic") ? current.centerY : 50,
      };
    case "mesh": {
      // Ensure at least 3 stops for mesh gradients by interpolating if needed
      let stops: GradientStop[] = current.type === "mesh"
        ? current.stops
        : [...current.stops];

      while (stops.length < 3 && stops.length >= 2) {
        const sorted = sortStops(stops);
        let maxGap = -1;
        let insertAfter = 0;
        for (let i = 0; i < sorted.length - 1; i++) {
          const gap = sorted[i + 1]!.position - sorted[i]!.position;
          if (gap > maxGap) {
            maxGap = gap;
            insertAfter = i;
          }
        }
        const left = sorted[insertAfter]!;
        const right = sorted[insertAfter + 1]!;
        const midPos = Math.round((left.position + right.position) / 2);
        const midColor = interpolateColorAt(sorted, midPos);
        stops = sortStops([...stops, createGradientStop(midColor, midPos)]);
      }

      // Assign default x/y coordinates for stops that don't already have them
      const meshStops: MeshGradientStop[] = stops.map((s, i) => ({
        ...s,
        x: "x" in s && typeof s.x === "number" ? s.x : (DEFAULT_MESH_XY[i % DEFAULT_MESH_XY.length]!).x,
        y: "y" in s && typeof s.y === "number" ? s.y : (DEFAULT_MESH_XY[i % DEFAULT_MESH_XY.length]!).y,
      })) as MeshGradientStop[];

      // Preserve existing mesh baseColor; for non-mesh sources, default to
      // white unless any stop is transparent (user likely wants transparency).
      let baseColor: string | undefined;
      if (current.type === "mesh") {
        baseColor = current.baseColor;
      } else {
        const hasTransparency = current.stops.some((s) => colord(s.color).alpha() < 1);
        baseColor = hasTransparency ? undefined : "#ffffff";
      }

      return {
        type: "mesh",
        stops: meshStops,
        baseColor,
      };
    }
  }
}

interface UseGradientOptions {
  value?: GradientValue;
  onValueChange?: (value: GradientValue) => void;
}

/**
 * State management hook for gradient editing.
 */
export function useGradient(options: UseGradientOptions) {
  const { value, onValueChange } = options;

  // Stabilize the default gradient so it doesn't regenerate new stop IDs
  // on every render when `value` is undefined.
  const defaultGradientRef = useRef<GradientValue | null>(null);
  if (!defaultGradientRef.current) {
    defaultGradientRef.current = createDefaultGradient("linear");
  }
  const gradient = value ?? defaultGradientRef.current;

  // Keep a ref to the current gradient so callbacks can read the latest
  // value without listing `gradient` in their dependency arrays. This
  // prevents all callbacks from getting new references on every render.
  const gradientRef = useRef(gradient);
  gradientRef.current = gradient;

  const [activeStopId, setActiveStopId] = useState<string | null>(
    gradient.stops[0]?.id ?? null
  );
  const activeStopIdRef = useRef(activeStopId);
  activeStopIdRef.current = activeStopId;

  // When the parent replaces the gradient (e.g., selecting a swatch),
  // the new stops have different IDs. Detect stale activeStopId and reset.
  // Uses useEffect (not render-phase mutation) for Concurrent Mode safety.
  useEffect(() => {
    if (value && !value.stops.some((s) => s.id === activeStopId)) {
      setActiveStopId(value.stops[0]?.id ?? null);
    }
  }, [value, activeStopId]);

  const update = useCallback(
    (newGradient: GradientValue) => {
      onValueChange?.(newGradient);
    },
    [onValueChange]
  );

  // All callbacks read from gradientRef.current instead of closing over
  // `gradient`, so their references remain stable across renders.
  const handleAddStop = useCallback(
    (color: string, position: number) => {
      const g = gradientRef.current;
      const updated = addStop(g, color, position);
      update(updated);
      const newStop = updated.stops.find(
        (s) => !g.stops.some((gs) => gs.id === s.id)
      );
      if (newStop) {
        setActiveStopId(newStop.id);
      }
    },
    [update]
  );

  const handleAddStopWithCoordinates = useCallback(
    (color: string, position: number, x: number, y: number) => {
      const g = gradientRef.current;
      const updated = addStopWithCoordinates(g, color, position, x, y);
      update(updated);
      const newStop = updated.stops.find(
        (s) => !g.stops.some((gs) => gs.id === s.id)
      );
      if (newStop) {
        setActiveStopId(newStop.id);
      }
    },
    [update]
  );

  const handleRemoveStop = useCallback(
    (stopId: string) => {
      const updated = removeStop(gradientRef.current, stopId);
      update(updated);
      if (activeStopIdRef.current === stopId) {
        setActiveStopId(updated.stops[0]?.id ?? null);
      }
    },
    [update]
  );

  const updateStopColor = useCallback(
    (stopId: string, color: string) => {
      const updated = updateStop(gradientRef.current, stopId, { color });
      update(updated);
    },
    [update]
  );

  const updateStopPosition = useCallback(
    (stopId: string, position: number) => {
      const updated = updateStop(gradientRef.current, stopId, { position });
      update(updated);
    },
    [update]
  );

  const updateStopCoordinates = useCallback(
    (stopId: string, x: number, y: number) => {
      const updated = updateStop(gradientRef.current, stopId, { x, y } as Partial<MeshGradientStop>);
      update(updated);
    },
    [update]
  );

  const setGradientType = useCallback(
    (type: GradientValue["type"]) => {
      const current = gradientRef.current;
      update(changeGradientType(current, type));
    },
    [update]
  );

  const setAngle = useCallback(
    (angle: number) => {
      const current = gradientRef.current;
      if (current.type === "linear") {
        update({ ...current, angle, startPoint: undefined, endPoint: undefined });
      } else if (current.type === "conic") {
        update({ ...current, angle, startPoint: undefined, endPoint: undefined });
      }
    },
    [update]
  );

  const setCenter = useCallback(
    (centerX: number, centerY: number) => {
      const current = gradientRef.current;
      if (current.type === "radial") {
        update({ ...current, centerX, centerY, startPoint: undefined, endPoint: undefined });
      } else if (current.type === "conic") {
        update({ ...current, centerX, centerY, startPoint: undefined, endPoint: undefined });
      }
    },
    [update]
  );

  const setBaseColor = useCallback(
    (color: string) => {
      const current = gradientRef.current;
      if (current.type === "mesh") {
        update({ ...current, baseColor: color });
      }
    },
    [update]
  );

  const handleMoveStop = useCallback(
    (stopId: string, direction: "forward" | "backward" | "front" | "back") => {
      const updated = moveStopUtil(gradientRef.current, stopId, direction);
      update(updated);
    },
    [update]
  );

  const replaceGradient = useCallback(
    (newGradient: GradientValue) => {
      update(newGradient);
    },
    [update]
  );

  const activeStop = gradient.stops.find((s) => s.id === activeStopId) ?? null;

  return useMemo(() => ({
    gradient,
    activeStopId,
    activeStop,
    setActiveStopId,
    addStop: handleAddStop,
    addStopWithCoordinates: handleAddStopWithCoordinates,
    removeStop: handleRemoveStop,
    updateStopColor,
    updateStopPosition,
    updateStopCoordinates,
    setGradientType,
    setAngle,
    setCenter,
    setBaseColor,
    moveStop: handleMoveStop,
    replaceGradient,
  }), [
    gradient, activeStopId, activeStop,
    handleAddStop, handleAddStopWithCoordinates, handleRemoveStop,
    updateStopColor, updateStopPosition, updateStopCoordinates,
    setGradientType, setAngle, setCenter, setBaseColor,
    handleMoveStop, replaceGradient,
  ]);
}
