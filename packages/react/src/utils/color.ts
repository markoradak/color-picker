import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import a11yPlugin from "colord/plugins/a11y";
import mixPlugin from "colord/plugins/mix";
import type { ColorFormat, ColorTokens, HSVA, AutoTokensConfig } from "../types";

// Register colord plugins
extend([namesPlugin, a11yPlugin, mixPlugin]);

export { colord };

// ── OKLCH conversion helpers ────────────────────────────────────────────
// Based on Björn Ottosson's OKLab specification.
// https://bottosson.github.io/posts/oklab/

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

interface OKLCH {
  l: number; // 0-1
  c: number; // 0-~0.4
  h: number; // 0-360
  a: number; // 0-1 (alpha)
}

function rgbaToOklch(r: number, g: number, b: number, a: number): OKLCH {
  // sRGB 0-255 → linear
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);

  // Linear sRGB → LMS
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // LMS → OKLab (cube root)
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // OKLab → OKLCH
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: C < 0.0001 ? 0 : H, a };
}

function oklchToRgba(L: number, C: number, H: number, a: number): { r: number; g: number; b: number; a: number } {
  // OKLCH → OKLab
  const hRad = (H * Math.PI) / 180;
  const A = C * Math.cos(hRad);
  const B = C * Math.sin(hRad);

  // OKLab → LMS (cube)
  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.2914855480 * B;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS → linear sRGB
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // linear → sRGB, clamp 0-255
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(linearToSrgb(v) * 255)));

  return { r: clamp(lr), g: clamp(lg), b: clamp(lb), a };
}

/** Format OKLCH values to a CSS oklch() string. */
function formatOklchString(oklch: OKLCH): string {
  const l = +(oklch.l * 100).toFixed(2);
  const c = +oklch.c.toFixed(4);
  const h = +oklch.h.toFixed(2);
  if (oklch.a < 1) {
    return `oklch(${l}% ${c} ${h} / ${+oklch.a.toFixed(2)})`;
  }
  return `oklch(${l}% ${c} ${h})`;
}

/** Regex for parsing oklch() CSS strings. */
const OKLCH_RE =
  /^oklch\(\s*([+-]?\d*\.?\d+)(%?)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i;

const ANGLE_FACTORS: Record<string, number> = { deg: 1, rad: 180 / Math.PI, grad: 0.9, turn: 360 };

/**
 * Parse an oklch() CSS string into RGBA values (0-255).
 * Returns null if the string is not a valid oklch() function.
 */
function parseOklchString(input: string): { r: number; g: number; b: number; a: number } | null {
  const match = OKLCH_RE.exec(input.trim());
  if (!match) return null;

  let L = Number(match[1]);
  if (match[2] === "%") L /= 100; // percentage → 0-1
  const C = Number(match[3]);
  let H = Number(match[4]);
  if (match[5]) H *= ANGLE_FACTORS[match[5]] ?? 1;
  const a = match[6] !== undefined ? Number(match[6]) / (match[7] ? 100 : 1) : 1;

  return oklchToRgba(L, C, H, a);
}

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
  if (format === "oklch") {
    // Parse input to RGBA first, then convert to OKLCH
    const rgba = parseOklchString(input) ?? (() => {
      const c = colord(input);
      if (!c.isValid()) return null;
      const rgb = c.toRgb();
      return { r: rgb.r, g: rgb.g, b: rgb.b, a: c.alpha() };
    })();
    if (!rgba) return input;
    return formatOklchString(rgbaToOklch(rgba.r, rgba.g, rgba.b, rgba.a));
  }

  // For non-OKLCH formats, convert OKLCH input to hex first for colord
  const resolved = parseOklchString(input);
  const c = resolved
    ? colord({ r: resolved.r, g: resolved.g, b: resolved.b }).alpha(resolved.a)
    : colord(input);

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
  if (trimmed.startsWith("oklch")) return "oklch";
  if (trimmed.startsWith("rgb")) return "rgb";
  if (trimmed.startsWith("hsl")) return "hsl";
  return "hex";
}

/**
 * Check if a string is a valid color.
 */
export function isValidColor(input: string): boolean {
  if (parseOklchString(input)) return true;
  return colord(input).isValid();
}

/**
 * Convert a color string to HSVA for internal state.
 * Returns white `{h:0, s:0, v:100, a:1}` for invalid input (CSS variables,
 * empty strings, gradient strings) to make the fallback visible rather than
 * silently producing black.
 */
export function toHSVA(input: string): HSVA {
  if (!isValidColor(input)) {
    return { h: 0, s: 0, v: 100, a: 1 };
  }
  // Handle oklch() input by converting to RGBA first
  const oklchRgba = parseOklchString(input);
  const c = oklchRgba
    ? colord({ r: oklchRgba.r, g: oklchRgba.g, b: oklchRgba.b }).alpha(oklchRgba.a)
    : colord(input);
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
  if (tokens && Object.hasOwn(tokens, value)) {
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

// ── Contrast ratio helpers ──────────────────────────────────────────────

/**
 * WCAG conformance level for a contrast ratio.
 */
export type WcagLevel = "AAA" | "AA" | "AA18" | "Fail";

/**
 * Calculate the WCAG 2.1 contrast ratio between two colors.
 * Accepts any color format the library supports (hex, rgb, hsl, oklch, named).
 * Returns a ratio from 1 (identical) to 21 (black vs white).
 */
export function contrastRatio(color1: string, color2: string): number {
  const c1 = oklchOrColord(color1);
  const c2 = oklchOrColord(color2);
  return c1.contrast(c2);
}

/**
 * Determine the highest WCAG 2.1 conformance level a contrast ratio achieves.
 * - "AAA"  — ratio >= 7   (normal text, enhanced)
 * - "AA"   — ratio >= 4.5 (normal text, minimum)
 * - "AA18" — ratio >= 3   (large text / UI components)
 * - "Fail" — ratio < 3
 */
export function getWcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA18";
  return "Fail";
}

/**
 * Walk up the DOM tree from `element` to find the effective background color.
 * Skips transparent layers and composites when an opaque background is found.
 * Falls back to white (`#ffffff`) if no opaque ancestor is found.
 */
export function getEffectiveBackgroundColor(element: HTMLElement): string {
  let current: HTMLElement | null = element;

  while (current) {
    const bg = getComputedStyle(current).backgroundColor;
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      const c = colord(bg);
      if (c.isValid() && c.alpha() > 0) {
        return c.alpha() >= 1 ? c.toHex() : blendOnWhite(c);
      }
    }
    current = current.parentElement;
  }

  return "#ffffff";
}

/** Blend a semi-transparent color onto white to get the effective opaque color. */
function blendOnWhite(c: ReturnType<typeof colord>): string {
  const rgb = c.toRgb();
  const a = c.alpha();
  const blend = (channel: number) => Math.round(channel * a + 255 * (1 - a));
  return colord({ r: blend(rgb.r), g: blend(rgb.g), b: blend(rgb.b) }).toHex();
}

/** Parse a color string (oklch-aware) into a colord instance. */
function oklchOrColord(input: string): ReturnType<typeof colord> {
  const rgba = parseOklchString(input);
  return rgba
    ? colord({ r: rgba.r, g: rgba.g, b: rgba.b }).alpha(rgba.a)
    : colord(input);
}

// ── Fast HSV contrast helpers (no string alloc, used by contrast line) ──

/** Convert a single sRGB channel (0-1) to linear. */
function srgbChannelToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance from linear RGB channels (0-1). */
function luminanceFromLinear(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Compute relative luminance directly from HSV + alpha,
 * blending onto a white background when alpha < 1.
 * All inputs in picker-native units: h 0-360, s 0-100, v 0-100, a 0-1.
 */
export function hsvLuminance(h: number, s: number, v: number, a: number): number {
  // HSV → sRGB (0-1)
  const S = s / 100;
  const V = v / 100;
  const C = V * S;
  const hp = h / 60;
  const X = C * (1 - Math.abs((hp % 2) - 1));
  const m = V - C;

  let r: number, g: number, b: number;
  if (hp < 1)      { r = C; g = X; b = 0; }
  else if (hp < 2) { r = X; g = C; b = 0; }
  else if (hp < 3) { r = 0; g = C; b = X; }
  else if (hp < 4) { r = 0; g = X; b = C; }
  else if (hp < 5) { r = X; g = 0; b = C; }
  else             { r = C; g = 0; b = X; }

  r += m; g += m; b += m;

  // Blend onto white when translucent
  if (a < 1) {
    r = r * a + 1 * (1 - a);
    g = g * a + 1 * (1 - a);
    b = b * a + 1 * (1 - a);
  }

  return luminanceFromLinear(
    srgbChannelToLinear(r),
    srgbChannelToLinear(g),
    srgbChannelToLinear(b),
  );
}

/** WCAG contrast ratio from two luminances. */
export function contrastFromLuminances(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Compute the relative luminance of any parsed color string. */
export function colorLuminance(color: string): number {
  const rgba = parseOklchString(color);
  const c = rgba
    ? colord({ r: rgba.r, g: rgba.g, b: rgba.b }).alpha(rgba.a)
    : colord(color);
  return c.luminance();
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
      if (/(^|[\s,])(:root|html)([\s,.:{[>+~]|$)/i.test(rule.selectorText)) {
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
