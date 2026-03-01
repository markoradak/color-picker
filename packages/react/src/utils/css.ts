import type { ColorPickerValue, GradientValue, SolidColor } from "../types";
import { isValidColor } from "./color";
import { sortStops } from "./gradient";

/**
 * Sanitize a color string, returning "transparent" for invalid values.
 */
function sanitizeColor(color: string): string {
  return isValidColor(color) ? color : "transparent";
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
      // Mesh gradients are simulated as layered radial gradients
      const layers = value.stops
        .map(
          (stop) =>
            `radial-gradient(circle at ${stop.x ?? 50}% ${stop.y ?? 50}%, ${sanitizeColor(stop.color)} 0%, transparent 50%)`
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
 * Parse a CSS gradient string into a structured ColorPickerValue.
 * Returns the raw string if it cannot be parsed as a gradient.
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

  // TODO: Implement full CSS gradient parsing in Phase 2
  // For now, return the raw string as a solid color fallback
  return trimmed;
}
