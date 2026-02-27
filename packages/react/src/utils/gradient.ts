import type { GradientStop, GradientValue } from "../types";

let stopIdCounter = 0;

/**
 * Generate a unique ID for a gradient stop.
 */
function generateStopId(): string {
  return `stop-${++stopIdCounter}-${Date.now().toString(36)}`;
}

/**
 * Create a new gradient stop.
 */
export function createGradientStop(
  color: string,
  position: number
): GradientStop {
  return {
    id: generateStopId(),
    color,
    position: Math.max(0, Math.min(100, position)),
  };
}

/**
 * Sort stops by position (ascending).
 */
export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/**
 * Add a stop to a gradient.
 */
export function addStop(
  gradient: GradientValue,
  color: string,
  position: number
): GradientValue {
  return {
    ...gradient,
    stops: sortStops([...gradient.stops, createGradientStop(color, position)]),
  };
}

/**
 * Remove a stop from a gradient (minimum 2 stops enforced).
 */
export function removeStop(
  gradient: GradientValue,
  stopId: string
): GradientValue {
  if (gradient.stops.length <= 2) return gradient;
  return {
    ...gradient,
    stops: gradient.stops.filter((s) => s.id !== stopId),
  };
}

/**
 * Update a stop's properties.
 */
export function updateStop(
  gradient: GradientValue,
  stopId: string,
  updates: Partial<GradientStop>
): GradientValue {
  return {
    ...gradient,
    stops: gradient.stops.map((s) =>
      s.id === stopId ? { ...s, ...updates } : s
    ),
  };
}

/**
 * Create a default gradient of the specified type.
 */
export function createDefaultGradient(
  type: GradientValue["type"] = "linear"
): GradientValue {
  const base: GradientValue = {
    type,
    stops: [
      createGradientStop("#000000", 0),
      createGradientStop("#ffffff", 100),
    ],
  };

  switch (type) {
    case "linear":
      return { ...base, angle: 90 };
    case "radial":
      return { ...base, centerX: 50, centerY: 50 };
    case "conic":
      return { ...base, angle: 0, centerX: 50, centerY: 50 };
    case "mesh":
      return {
        ...base,
        stops: [
          { ...base.stops[0]!, x: 25, y: 25 },
          { ...base.stops[1]!, x: 75, y: 75 },
        ],
      };
    default:
      return base;
  }
}
