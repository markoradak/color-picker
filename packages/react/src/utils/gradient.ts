import type { GradientStop, GradientValue, MeshGradientStop } from "../types";
import { colord } from "./color";

/**
 * Generate a unique ID for a gradient stop.
 */
export function generateStopId(): string {
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
 * Create a new mesh gradient stop with 2D coordinates.
 */
export function createMeshGradientStop(
  color: string,
  position: number,
  x: number,
  y: number
): MeshGradientStop {
  return {
    id: generateStopId(),
    color,
    position: Math.max(0, Math.min(100, position)),
    x,
    y,
  };
}

/**
 * Sort stops by position (ascending).
 * Works with both GradientStop and MeshGradientStop.
 */
export function sortStops<T extends GradientStop | MeshGradientStop>(stops: T[]): T[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/**
 * Add a stop to a gradient.
 * For mesh gradients, use addStopWithCoordinates instead.
 */
export function addStop(
  gradient: GradientValue,
  color: string,
  position: number
): GradientValue {
  if (gradient.type === "mesh") {
    // For mesh gradients, default coordinates to center
    const meshStop = createMeshGradientStop(color, position, 50, 50);
    return { ...gradient, stops: [...gradient.stops, meshStop] };
  }
  const newStop = createGradientStop(color, position);
  return { ...gradient, stops: sortStops([...gradient.stops, newStop]) } as GradientValue;
}

/**
 * Add a stop to a mesh gradient with explicit 2D coordinates.
 */
export function addStopWithCoordinates(
  gradient: GradientValue,
  color: string,
  position: number,
  x: number,
  y: number
): GradientValue {
  if (gradient.type === "mesh") {
    const stop = createMeshGradientStop(color, position, x, y);
    return { ...gradient, stops: [...gradient.stops, stop] };
  }
  // For non-mesh gradients, ignore coordinates
  return addStop(gradient, color, position);
}

/**
 * Remove a stop from a gradient (minimum 2 stops enforced).
 */
export function removeStop(
  gradient: GradientValue,
  stopId: string
): GradientValue {
  if (gradient.stops.length <= 2) return gradient;
  if (gradient.type === "mesh") {
    return { ...gradient, stops: gradient.stops.filter((s) => s.id !== stopId) };
  }
  return { ...gradient, stops: gradient.stops.filter((s) => s.id !== stopId) } as GradientValue;
}

/**
 * Update a stop's properties.
 * When the `position` field is updated, the stops array is re-sorted
 * to maintain ascending position order (consistent with `addStop`).
 */
export function updateStop(
  gradient: GradientValue,
  stopId: string,
  updates: Partial<GradientStop> | Partial<MeshGradientStop>
): GradientValue {
  if (gradient.type === "mesh") {
    return {
      ...gradient,
      stops: gradient.stops.map((s) =>
        s.id === stopId ? { ...s, ...updates } as MeshGradientStop : s
      ),
    };
  }
  const updatedStops = gradient.stops.map((s) =>
    s.id === stopId ? { ...s, ...updates } : s
  );
  return {
    ...gradient,
    stops: updates.position !== undefined ? sortStops(updatedStops) : updatedStops,
  } as GradientValue;
}

/**
 * Move a stop within the array to change its z-ordering (paint order).
 * For mesh gradients, array order determines CSS layer stacking (first = top).
 *
 * @param direction - "forward" moves toward index 0 (front), "backward" moves toward last (back),
 *   "front" moves to index 0, "back" moves to last index
 */
export function moveStop(
  gradient: GradientValue,
  stopId: string,
  direction: "forward" | "backward" | "front" | "back"
): GradientValue {
  const index = gradient.stops.findIndex((s) => s.id === stopId);
  if (index === -1) return gradient;

  const stops = [...gradient.stops];
  const [stop] = stops.splice(index, 1);

  switch (direction) {
    case "forward": {
      if (index === 0) return gradient;
      stops.splice(index - 1, 0, stop!);
      break;
    }
    case "backward": {
      if (index === gradient.stops.length - 1) return gradient;
      stops.splice(index + 1, 0, stop!);
      break;
    }
    case "front": {
      if (index === 0) return gradient;
      stops.unshift(stop!);
      break;
    }
    case "back": {
      if (index === gradient.stops.length - 1) return gradient;
      stops.push(stop!);
      break;
    }
  }

  if (gradient.type === "mesh") {
    return { ...gradient, stops: stops as MeshGradientStop[] };
  }
  return { ...gradient, stops: stops as GradientStop[] } as GradientValue;
}

/**
 * Interpolate a color at a given position (0-100) between sorted stops.
 * Returns the mixed color as a hex string.
 * Works with both GradientStop and MeshGradientStop arrays.
 */
export function interpolateColorAt(
  stops: (GradientStop | MeshGradientStop)[],
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
  switch (type) {
    case "linear":
      return {
        type: "linear",
        angle: 90,
        stops: [createGradientStop(color, 0), createGradientStop("#ffffff", 100)],
      };
    case "radial":
      return {
        type: "radial",
        centerX: 50,
        centerY: 50,
        stops: [createGradientStop(color, 0), createGradientStop("#ffffff", 100)],
      };
    case "conic":
      return {
        type: "conic",
        angle: 0,
        centerX: 50,
        centerY: 50,
        stops: [createGradientStop(color, 0), createGradientStop("#ffffff", 100)],
      };
    case "mesh": {
      const midColor = colord(color).mix(colord("#ffffff"), 0.5).toHex();
      return {
        type: "mesh",
        baseColor: "#ffffff",
        stops: [
          createMeshGradientStop(color, 0, 25, 25),
          createMeshGradientStop(midColor, 50, 65, 80),
          createMeshGradientStop("#ffffff", 100, 80, 50),
        ],
      };
    }
  }
}

/**
 * Create a default gradient of the specified type.
 */
export function createDefaultGradient(
  type: GradientValue["type"] = "linear"
): GradientValue {
  switch (type) {
    case "linear":
      return {
        type: "linear",
        angle: 90,
        stops: [createGradientStop("#000000", 0), createGradientStop("#ffffff", 100)],
      };
    case "radial":
      return {
        type: "radial",
        centerX: 50,
        centerY: 50,
        stops: [createGradientStop("#000000", 0), createGradientStop("#ffffff", 100)],
      };
    case "conic":
      return {
        type: "conic",
        angle: 0,
        centerX: 50,
        centerY: 50,
        stops: [createGradientStop("#000000", 0), createGradientStop("#ffffff", 100)],
      };
    case "mesh":
      return {
        type: "mesh",
        baseColor: "#ffffff",
        stops: [
          createMeshGradientStop("#000000", 0, 25, 25),
          createMeshGradientStop("#808080", 50, 65, 80),
          createMeshGradientStop("#ffffff", 100, 80, 50),
        ],
      };
  }
}
