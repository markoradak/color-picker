import { useCallback, useEffect, useRef, useState } from "react";
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

  const [activeStopId, setActiveStopId] = useState<string | null>(
    gradient.stops[0]?.id ?? null
  );

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

  const handleAddStop = useCallback(
    (color: string, position: number) => {
      const updated = addStop(gradient, color, position);
      update(updated);
      // Select the newly added stop
      const newStop = updated.stops.find(
        (s) => !gradient.stops.some((gs) => gs.id === s.id)
      );
      if (newStop) {
        setActiveStopId(newStop.id);
      }
    },
    [gradient, update]
  );

  const handleAddStopWithCoordinates = useCallback(
    (color: string, position: number, x: number, y: number) => {
      const updated = addStopWithCoordinates(gradient, color, position, x, y);
      update(updated);
      // Select the newly added stop
      const newStop = updated.stops.find(
        (s) => !gradient.stops.some((gs) => gs.id === s.id)
      );
      if (newStop) {
        setActiveStopId(newStop.id);
      }
    },
    [gradient, update]
  );

  const handleRemoveStop = useCallback(
    (stopId: string) => {
      const updated = removeStop(gradient, stopId);
      update(updated);
      // If we removed the active stop, select the first one
      if (activeStopId === stopId) {
        setActiveStopId(updated.stops[0]?.id ?? null);
      }
    },
    [gradient, update, activeStopId]
  );

  const updateStopColor = useCallback(
    (stopId: string, color: string) => {
      const updated = updateStop(gradient, stopId, { color });
      update(updated);
    },
    [gradient, update]
  );

  const updateStopPosition = useCallback(
    (stopId: string, position: number) => {
      const updated = updateStop(gradient, stopId, { position });
      update(updated);
    },
    [gradient, update]
  );

  const updateStopCoordinates = useCallback(
    (stopId: string, x: number, y: number) => {
      const updated = updateStop(gradient, stopId, { x, y });
      update(updated);
    },
    [gradient, update]
  );

  const setGradientType = useCallback(
    (type: GradientValue["type"]) => {
      update({ ...gradient, type, startPoint: undefined, endPoint: undefined });
    },
    [gradient, update]
  );

  const setAngle = useCallback(
    (angle: number) => {
      update({ ...gradient, angle, startPoint: undefined, endPoint: undefined });
    },
    [gradient, update]
  );

  const setCenter = useCallback(
    (centerX: number, centerY: number) => {
      update({ ...gradient, centerX, centerY, startPoint: undefined, endPoint: undefined });
    },
    [gradient, update]
  );

  const setBaseColor = useCallback(
    (color: string) => {
      update({ ...gradient, baseColor: color });
    },
    [gradient, update]
  );

  const handleMoveStop = useCallback(
    (stopId: string, direction: "forward" | "backward" | "front" | "back") => {
      const updated = moveStopUtil(gradient, stopId, direction);
      update(updated);
    },
    [gradient, update]
  );

  const replaceGradient = useCallback(
    (newGradient: GradientValue) => {
      update(newGradient);
    },
    [update]
  );

  const activeStop = gradient.stops.find((s) => s.id === activeStopId) ?? null;

  return {
    gradient,
    activeStopId,
    activeStop,
    setActiveStopId: setActiveStopId,
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
  };
}
