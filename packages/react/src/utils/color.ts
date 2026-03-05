import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import a11yPlugin from "colord/plugins/a11y";
import mixPlugin from "colord/plugins/mix";
import type { ColorFormat, ColorTokens, HSVA, AutoTokensConfig } from "../types";

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

/**
 * Resolve a value that might be a token name to its actual color string.
 * If the value exists as a key in the tokens map, returns the mapped color.
 * Otherwise returns the value unchanged.
 */
export function resolveToken(value: string, tokens?: ColorTokens): string {
  if (tokens && value in tokens) {
    return tokens[value]!;
  }
  return value;
}

/**
 * Find the token name whose resolved color matches the given hex value.
 * Comparison is done via HSVA roundtrip to account for rounding in
 * the hex↔HSV conversion pipeline.
 * Returns undefined if no token matches.
 */
export function findMatchingToken(
  hexValue: string,
  tokens?: ColorTokens
): string | undefined {
  if (!tokens) return undefined;
  // Normalize target through the same HSVA pipeline the picker uses
  const targetHex = fromHSVA(toHSVA(hexValue));
  for (const [name, tokenColor] of Object.entries(tokens)) {
    const tokenHex = fromHSVA(toHSVA(tokenColor));
    if (tokenHex === targetHex) {
      return name;
    }
  }
  return undefined;
}

/** Internal prefixes to skip when auto-detecting (library internals, Tailwind internals) */
const INTERNAL_PREFIXES = ["--cp-", "--tw-"];

/**
 * Collect custom property names from all stylesheets that target the root element.
 * Matches :root, html, and selectors containing them (e.g., `:root, :host`).
 * Skips internal variables (--cp-*, --tw-*) unless an explicit prefix is given.
 */
function collectRootCustomProperties(prefix?: string): Set<string> {
  const propertyNames = new Set<string>();

  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        collectFromRules(sheet.cssRules, propertyNames, prefix);
      } catch {
        // CORS: skip cross-origin stylesheets
      }
    }
  } catch {
    // Stylesheet access may fail entirely in some environments
  }

  return propertyNames;
}

/**
 * Recursively collect custom property names from CSS rules.
 * Handles nested rules (e.g., @layer, @supports) and matches any rule
 * whose selector targets the document root (:root, html).
 */
function collectFromRules(
  rules: CSSRuleList,
  propertyNames: Set<string>,
  prefix?: string
): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      // Match selectors that target the root: :root, html, or compound selectors containing them
      if (/(^|[\s,])(:root|html)([\s,:{[>+~]|$)/i.test(rule.selectorText)) {
        for (const prop of Array.from(rule.style)) {
          if (!prop.startsWith("--")) continue;
          if (prefix) {
            // Explicit prefix: only include matching
            if (prop.startsWith(prefix)) propertyNames.add(prop);
          } else {
            // No prefix: include all except internal prefixes
            const isInternal = INTERNAL_PREFIXES.some((p) => prop.startsWith(p));
            if (!isInternal) propertyNames.add(prop);
          }
        }
      }
    } else if ("cssRules" in rule) {
      // Recurse into grouping rules (@layer, @supports, @media, etc.)
      collectFromRules((rule as CSSGroupingRule).cssRules, propertyNames, prefix);
    }
  }
}

/**
 * Scan the DOM for CSS custom properties that resolve to valid colors.
 *
 * Collects property names from stylesheets (including nested @layer / @supports rules
 * and Tailwind v4 `@theme` blocks), then resolves values via getComputedStyle.
 *
 * @param prefix - Optional prefix to filter variables (e.g., "--brand-"). Only matching variables are included, and the prefix is stripped from display names.
 * @returns A map of display names to resolved color values.
 */
export function getCSSColorTokens(prefix?: string): ColorTokens {
  if (typeof document === "undefined") return {};

  const propertyNames = collectRootCustomProperties(prefix);

  if (propertyNames.size === 0) return {};

  // Resolve computed values and filter to valid colors
  const computed = getComputedStyle(document.documentElement);
  const tokens: ColorTokens = {};

  for (const prop of propertyNames) {
    const value = computed.getPropertyValue(prop).trim();
    if (value && isValidColor(value)) {
      let displayName = prefix
        ? prop.slice(prefix.length)
        : prop.slice(2); // strip "--"
      // Strip common Tailwind v4 "color-" prefix for cleaner display names
      if (!prefix && displayName.startsWith("color-")) {
        displayName = displayName.slice(6);
      }
      tokens[displayName] = value;
    }
  }

  return tokens;
}
