import type { GradientStop, GradientValue } from "../types";
import { colord } from "./color";

/**
 * Generate a unique ID for a gradient stop.
 */
function generateStopId(): string {
  return `stop-${Math.random().toString(36).slice(2, 10)}`;
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
 * Add a stop to a gradient with 2D coordinates (for mesh gradients).
 */
export function addStopWithCoordinates(
  gradient: GradientValue,
  color: string,
  position: number,
  x: number,
  y: number
): GradientValue {
  const stop = { ...createGradientStop(color, position), x, y };
  return {
    ...gradient,
    stops: [...gradient.stops, stop],
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
 * Interpolate a color at a given position (0-100) between sorted stops.
 * Returns the mixed color as a hex string.
 */
export function interpolateColorAt(
  stops: GradientStop[],
  position: number
): string {
  const sorted = sortStops(stops);
  if (sorted.length === 0) return "#808080";
  if (sorted.length === 1) return sorted[0]!.color;

  let left = sorted[0]!;
  let right = sorted[sorted.length - 1]!;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i]!.position <= position && sorted[i + 1]!.position >= position) {
      left = sorted[i]!;
      right = sorted[i + 1]!;
      break;
    }
  }

  if (position <= left.position) return left.color;
  if (position >= right.position) return right.color;

  const range = right.position - left.position;
  const t = range === 0 ? 0 : (position - left.position) / range;
  return colord(left.color).mix(colord(right.color), t).toHex();
}

/**
 * Create a gradient of the specified type using an existing color as
 * the first stop and white as the second stop.
 */
export function createDefaultGradientFromColor(
  type: GradientValue["type"],
  color: string
): GradientValue {
  const base: GradientValue = {
    type,
    stops: [
      createGradientStop(color, 0),
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
