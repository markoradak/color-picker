import type { ColorPickerValue, GradientValue, SolidColor } from "../types";
import { colord, isValidColor } from "./color";
import { sortStops } from "./gradient";

/**
 * Sanitize a color string, returning "transparent" for invalid values.
 */
export function sanitizeColor(color: string): string {
  return isValidColor(color) ? color : "transparent";
}

/**
 * Create a zero-alpha version of a color string.
 * Used for mesh gradient blending to avoid black-fringing artifacts
 * that occur when interpolating toward `transparent` (which is `rgba(0,0,0,0)`).
 */
function toZeroAlpha(color: string): string {
  const c = colord(color);
  if (!c.isValid()) return "transparent";
  const { r, g, b } = c.toRgb();
  return `rgba(${r}, ${g}, ${b}, 0)`;
}

/**
 * Type guard: is the value a gradient?
 */
export function isGradient(value: ColorPickerValue): value is GradientValue {
  return typeof value === "object" && value !== null && "type" in value && "stops" in value;
}

/**
 * Type guard: is the value a solid color?
 */
export function isSolidColor(value: ColorPickerValue): value is SolidColor {
  return typeof value === "string";
}

/**
 * Convert a structured ColorPickerValue to a CSS string.
 */
export function toCSS(value: ColorPickerValue): string {
  if (isSolidColor(value)) {
    return sanitizeColor(value);
  }

  const sorted = sortStops(value.stops);
  const stopsCSS = sorted
    .map((stop) => `${sanitizeColor(stop.color)} ${Math.min(100, Math.max(0, stop.position))}%`)
    .join(", ");

  switch (value.type) {
    case "linear":
      return `linear-gradient(${value.angle ?? 90}deg, ${stopsCSS})`;

    case "radial":
      return `radial-gradient(circle at ${value.centerX ?? 50}% ${value.centerY ?? 50}%, ${stopsCSS})`;

    case "conic":
      return `conic-gradient(from ${value.angle ?? 0}deg at ${value.centerX ?? 50}% ${value.centerY ?? 50}%, ${stopsCSS})`;

    case "mesh": {
      // Mesh gradients are simulated as layered radial gradients.
      // Each blob fades to a zero-alpha version of its own color (not `transparent`)
      // to prevent black-fringing artifacts caused by interpolating toward rgba(0,0,0,0).
      const layers = value.stops
        .map(
          (stop) => {
            const color = sanitizeColor(stop.color);
            return `radial-gradient(circle at ${stop.x ?? 50}% ${stop.y ?? 50}%, ${color} 0%, ${toZeroAlpha(color)} 50%)`;
          }
        );
      if (value.baseColor) {
        layers.push(sanitizeColor(value.baseColor));
      }
      return layers.join(", ");
    }

    default:
      return stopsCSS;
  }
}

/**
 * Parse a comma-separated list of CSS color stops, handling commas
 * inside color functions like `rgb(...)` and `hsl(...)`.
 * Returns an array of `{ color, position }` strings.
 */
function parseColorStops(stopsStr: string): Array<{ color: string; position: number }> {
  const stops: Array<{ color: string; position: number }> = [];
  let depth = 0;
  let current = "";

  for (const ch of stopsStr) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;

    if (ch === "," && depth === 0) {
      const parsed = parseSingleStop(current.trim());
      if (parsed) stops.push(parsed);
      current = "";
    } else {
      current += ch;
    }
  }

  // Last segment
  const parsed = parseSingleStop(current.trim());
  if (parsed) stops.push(parsed);

  return stops;
}

/**
 * Parse a single stop segment like `#ff0000 50%` or `rgb(0,0,0) 0%`.
 */
function parseSingleStop(segment: string): { color: string; position: number } | null {
  if (!segment) return null;

  // Match an optional trailing percentage: `<color> <number>%`
  const percentMatch = segment.match(/^(.+?)\s+([\d.]+)%\s*$/);
  if (percentMatch) {
    const color = percentMatch[1]!.trim();
    const position = parseFloat(percentMatch[2]!);
    if (isValidColor(color) && !isNaN(position)) {
      return { color, position };
    }
  }

  // No percentage — treat the whole segment as a color at an auto position
  if (isValidColor(segment)) {
    return { color: segment, position: -1 }; // -1 signals "auto-distribute"
  }

  return null;
}

/**
 * Assign auto-distributed positions to stops that have position === -1.
 */
function distributePositions(stops: Array<{ color: string; position: number }>): Array<{ color: string; position: number }> {
  if (stops.length === 0) return stops;
  if (stops.length === 1) {
    if (stops[0]!.position === -1) stops[0]!.position = 0;
    return stops;
  }

  // First stop defaults to 0, last defaults to 100
  if (stops[0]!.position === -1) stops[0]!.position = 0;
  if (stops[stops.length - 1]!.position === -1) stops[stops.length - 1]!.position = 100;

  // Fill gaps between known positions
  let lastKnown = 0;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i]!.position !== -1) {
      // Backfill any -1 stops between lastKnown and i
      const gap = i - lastKnown;
      if (gap > 1) {
        const startPos = stops[lastKnown]!.position;
        const endPos = stops[i]!.position;
        for (let j = lastKnown + 1; j < i; j++) {
          stops[j]!.position = startPos + ((endPos - startPos) * (j - lastKnown)) / gap;
        }
      }
      lastKnown = i;
    }
  }

  return stops;
}

let stopIdCounter = 0;

/**
 * Parse a CSS gradient string into a structured ColorPickerValue.
 * Supports `linear-gradient`, `radial-gradient`, and `conic-gradient`.
 * Returns the raw string as a SolidColor if it cannot be parsed as a gradient.
 */
export function fromCSS(css: string): ColorPickerValue {
  const trimmed = css.trim();

  // If it doesn't look like a gradient, return as solid color
  if (
    !trimmed.startsWith("linear-gradient") &&
    !trimmed.startsWith("radial-gradient") &&
    !trimmed.startsWith("conic-gradient")
  ) {
    return trimmed;
  }

  // Extract the content inside the outermost parentheses
  const openParen = trimmed.indexOf("(");
  const closeParen = trimmed.lastIndexOf(")");
  if (openParen === -1 || closeParen === -1 || closeParen <= openParen) {
    return trimmed;
  }

  const prefix = trimmed.slice(0, openParen).trim();
  const inner = trimmed.slice(openParen + 1, closeParen).trim();

  if (prefix === "linear-gradient") {
    return parseLinearGradient(inner);
  }
  if (prefix === "radial-gradient") {
    return parseRadialGradient(inner);
  }
  if (prefix === "conic-gradient") {
    return parseConicGradient(inner);
  }

  return trimmed;
}

/**
 * Parse the inner content of a linear-gradient(...).
 */
function parseLinearGradient(inner: string): ColorPickerValue {
  let angle = 90; // default
  let stopsStr = inner;

  // Check for an angle like `90deg,` or `180deg,`
  const angleMatch = inner.match(/^\s*([\d.]+)deg\s*,\s*/);
  if (angleMatch) {
    angle = parseFloat(angleMatch[1]!);
    stopsStr = inner.slice(angleMatch[0].length);
  } else {
    // Check for direction keywords like `to right,`
    const dirMatch = inner.match(/^\s*to\s+(top|bottom|left|right)(?:\s+(top|bottom|left|right))?\s*,\s*/i);
    if (dirMatch) {
      angle = directionToAngle(dirMatch[1]!.toLowerCase(), dirMatch[2]?.toLowerCase());
      stopsStr = inner.slice(dirMatch[0].length);
    }
  }

  const rawStops = parseColorStops(stopsStr);
  if (rawStops.length < 2) return inner;

  const distributed = distributePositions(rawStops);
  const stops = distributed.map((s) => ({
    id: `stop-${(++stopIdCounter).toString(36)}`,
    color: s.color,
    position: s.position,
  }));

  return {
    type: "linear" as const,
    angle,
    stops,
  };
}

/**
 * Convert CSS direction keywords to an angle.
 */
function directionToAngle(primary: string, secondary?: string): number {
  if (!secondary) {
    switch (primary) {
      case "top": return 0;
      case "right": return 90;
      case "bottom": return 180;
      case "left": return 270;
      default: return 90;
    }
  }
  // Combined directions
  const combo = `${primary} ${secondary}`;
  switch (combo) {
    case "top right": return 45;
    case "top left": return 315;
    case "bottom right": return 135;
    case "bottom left": return 225;
    case "right top": return 45;
    case "left top": return 315;
    case "right bottom": return 135;
    case "left bottom": return 225;
    default: return 90;
  }
}

/**
 * Parse the inner content of a radial-gradient(...).
 */
function parseRadialGradient(inner: string): ColorPickerValue {
  let centerX = 50;
  let centerY = 50;
  let stopsStr = inner;

  // Match patterns like `circle at 50% 50%,` or `ellipse at 25% 75%,`
  const posMatch = inner.match(/^\s*(?:circle|ellipse)?\s*at\s+([\d.]+)%\s+([\d.]+)%\s*,\s*/i);
  if (posMatch) {
    centerX = parseFloat(posMatch[1]!);
    centerY = parseFloat(posMatch[2]!);
    stopsStr = inner.slice(posMatch[0].length);
  } else {
    // Also match just `circle,` or `ellipse,` without at-position
    const shapeMatch = inner.match(/^\s*(?:circle|ellipse)\s*,\s*/i);
    if (shapeMatch) {
      stopsStr = inner.slice(shapeMatch[0].length);
    }
  }

  const rawStops = parseColorStops(stopsStr);
  if (rawStops.length < 2) return inner;

  const distributed = distributePositions(rawStops);
  const stops = distributed.map((s) => ({
    id: `stop-${(++stopIdCounter).toString(36)}`,
    color: s.color,
    position: s.position,
  }));

  return {
    type: "radial" as const,
    centerX,
    centerY,
    stops,
  };
}

/**
 * Parse the inner content of a conic-gradient(...).
 */
function parseConicGradient(inner: string): ColorPickerValue {
  let angle = 0;
  let centerX = 50;
  let centerY = 50;
  let stopsStr = inner;

  // Match `from 45deg at 50% 50%,`
  const fullMatch = inner.match(/^\s*from\s+([\d.]+)deg\s+at\s+([\d.]+)%\s+([\d.]+)%\s*,\s*/i);
  if (fullMatch) {
    angle = parseFloat(fullMatch[1]!);
    centerX = parseFloat(fullMatch[2]!);
    centerY = parseFloat(fullMatch[3]!);
    stopsStr = inner.slice(fullMatch[0].length);
  } else {
    // Match `from 45deg,` without at-position
    const angleMatch = inner.match(/^\s*from\s+([\d.]+)deg\s*,\s*/i);
    if (angleMatch) {
      angle = parseFloat(angleMatch[1]!);
      stopsStr = inner.slice(angleMatch[0].length);
    }
  }

  const rawStops = parseColorStops(stopsStr);
  if (rawStops.length < 2) return inner;

  const distributed = distributePositions(rawStops);
  const stops = distributed.map((s) => ({
    id: `stop-${(++stopIdCounter).toString(36)}`,
    color: s.color,
    position: s.position,
  }));

  return {
    type: "conic" as const,
    angle,
    centerX,
    centerY,
    stops,
  };
}
