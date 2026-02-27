import { useCallback, useState } from "react";
import type { GradientValue } from "../types";
import {
  addStop,
  createDefaultGradient,
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

  const gradient = value ?? createDefaultGradient("linear");
  const [activeStopId, setActiveStopId] = useState<string | null>(
    gradient.stops[0]?.id ?? null
  );

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

  const setGradientType = useCallback(
    (type: GradientValue["type"]) => {
      update({ ...gradient, type });
    },
    [gradient, update]
  );

  const setAngle = useCallback(
    (angle: number) => {
      update({ ...gradient, angle });
    },
    [gradient, update]
  );

  const setCenter = useCallback(
    (centerX: number, centerY: number) => {
      update({ ...gradient, centerX, centerY });
    },
    [gradient, update]
  );

  const activeStop = gradient.stops.find((s) => s.id === activeStopId) ?? null;

  return {
    gradient,
    activeStopId,
    activeStop,
    setActiveStopId: setActiveStopId,
    addStop: handleAddStop,
    removeStop: handleRemoveStop,
    updateStopColor,
    updateStopPosition,
    setGradientType,
    setAngle,
    setCenter,
  };
}
