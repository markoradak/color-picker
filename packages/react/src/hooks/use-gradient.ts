import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GradientValue, MeshGradientStop } from "../types";
import {
  addStop,
  addStopWithCoordinates,
  createDefaultGradient,
  moveStop as moveStopUtil,
  removeStop,
  updateStop,
} from "../utils/gradient";

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
          ? current.stops.map(({ x: _x, y: _y, ...rest }) => rest)
          : current.stops,
        angle: (current.type === "linear" || current.type === "conic") ? current.angle : 90,
      };
    case "radial":
      return {
        type: "radial",
        stops: current.type === "mesh"
          ? current.stops.map(({ x: _x, y: _y, ...rest }) => rest)
          : current.stops,
        centerX: (current.type === "radial" || current.type === "conic") ? current.centerX : 50,
        centerY: (current.type === "radial" || current.type === "conic") ? current.centerY : 50,
      };
    case "conic":
      return {
        type: "conic",
        stops: current.type === "mesh"
          ? current.stops.map(({ x: _x, y: _y, ...rest }) => rest)
          : current.stops,
        angle: (current.type === "linear" || current.type === "conic") ? current.angle : 0,
        centerX: (current.type === "radial" || current.type === "conic") ? current.centerX : 50,
        centerY: (current.type === "radial" || current.type === "conic") ? current.centerY : 50,
      };
    case "mesh":
      return {
        type: "mesh",
        stops: current.stops.map((s, i) => ({
          ...s,
          x: "x" in s && typeof s.x === "number" ? s.x : (i / Math.max(1, current.stops.length - 1)) * 80 + 10,
          y: "y" in s && typeof s.y === "number" ? s.y : (i / Math.max(1, current.stops.length - 1)) * 80 + 10,
        })) as MeshGradientStop[],
        baseColor: current.type === "mesh" ? current.baseColor : undefined,
      };
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
