import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import a11yPlugin from "colord/plugins/a11y";
import mixPlugin from "colord/plugins/mix";
import type { ColorFormat, HSVA } from "../types";

// Register colord plugins
extend([namesPlugin, a11yPlugin, mixPlugin]);

export { colord };

/**
 * Parse any supported color string into a colord instance.
 */
export function parseColor(input: string) {
  return colord(input);
}

/**
 * Format a color string into the specified format.
 */
export function formatColor(input: string, format: ColorFormat): string {
  const c = colord(input);
  switch (format) {
    case "hex":
      return c.toHex();
    case "rgb":
      return c.toRgbString();
    case "hsl":
      return c.toHslString();
    default:
      return c.toHex();
  }
}

/**
 * Detect the format of a color string.
 */
export function detectFormat(input: string): ColorFormat {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.startsWith("rgb")) return "rgb";
  if (trimmed.startsWith("hsl")) return "hsl";
  return "hex";
}

/**
 * Check if a string is a valid color.
 */
export function isValidColor(input: string): boolean {
  return colord(input).isValid();
}

/**
 * Convert a color string to HSVA for internal state.
 */
export function toHSVA(input: string): HSVA {
  const c = colord(input);
  const hsv = c.toHsv();
  return {
    h: hsv.h,
    s: hsv.s,
    v: hsv.v,
    a: c.alpha(),
  };
}

/**
 * Convert HSVA values back to a hex string.
 */
export function fromHSVA(hsva: HSVA): string {
  return colord({ h: hsva.h, s: hsva.s, v: hsva.v }).alpha(hsva.a).toHex();
}

/**
 * Determine whether black or white text has better contrast against a background.
 */
export function getContrastColor(bg: string): "black" | "white" {
  return colord(bg).isLight() ? "black" : "white";
}
