import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GradientValue } from "../types";
import {
  addStop,
  addStopWithCoordinates,
  createDefaultGradient,
  moveStop as moveStopUtil,
  removeStop,
  updateStop,
} from "../utils/gradient";

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
      const updated = updateStop(gradientRef.current, stopId, { x, y });
      update(updated);
    },
    [update]
  );

  const setGradientType = useCallback(
    (type: GradientValue["type"]) => {
      update({ ...gradientRef.current, type, startPoint: undefined, endPoint: undefined });
    },
    [update]
  );

  const setAngle = useCallback(
    (angle: number) => {
      update({ ...gradientRef.current, angle, startPoint: undefined, endPoint: undefined });
    },
    [update]
  );

  const setCenter = useCallback(
    (centerX: number, centerY: number) => {
      update({ ...gradientRef.current, centerX, centerY, startPoint: undefined, endPoint: undefined });
    },
    [update]
  );

  const setBaseColor = useCallback(
    (color: string) => {
      update({ ...gradientRef.current, baseColor: color });
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
