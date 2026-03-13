import { describe, expect, it } from "vitest";
import {
  detectFormat,
  findMatchingToken,
  formatColor,
  fromHSVA,
  getCSSColorTokens,
  getContrastColor,
  isValidColor,
  parseColor,
  resolveToken,
  toHSVA,
} from "./color";

describe("color utilities", () => {
  describe("isValidColor", () => {
    it("validates hex colors", () => {
      expect(isValidColor("#ff0000")).toBe(true);
      expect(isValidColor("#f00")).toBe(true);
      expect(isValidColor("#ff000080")).toBe(true);
    });

    it("validates rgb colors", () => {
      expect(isValidColor("rgb(255, 0, 0)")).toBe(true);
      expect(isValidColor("rgba(255, 0, 0, 0.5)")).toBe(true);
    });

    it("validates hsl colors", () => {
      expect(isValidColor("hsl(0, 100%, 50%)")).toBe(true);
    });

    it("rejects invalid colors", () => {
      expect(isValidColor("not-a-color")).toBe(false);
      expect(isValidColor("#gggggg")).toBe(false);
    });

    it("validates named colors", () => {
      expect(isValidColor("red")).toBe(true);
      expect(isValidColor("tomato")).toBe(true);
      expect(isValidColor("cornflowerblue")).toBe(true);
    });

    it("validates transparent keyword", () => {
      expect(isValidColor("transparent")).toBe(true);
    });

    it("rejects empty string", () => {
      expect(isValidColor("")).toBe(false);
    });

    it("rejects whitespace-only strings", () => {
      expect(isValidColor("   ")).toBe(false);
    });

    it("validates hsla with alpha", () => {
      expect(isValidColor("hsla(120, 50%, 50%, 0.5)")).toBe(true);
    });

    it("validates oklch colors", () => {
      expect(isValidColor("oklch(63.7% 0.259 29.23)")).toBe(true);
      expect(isValidColor("oklch(50% 0.15 180)")).toBe(true);
    });

    it("validates oklch with alpha", () => {
      expect(isValidColor("oklch(63.7% 0.259 29.23 / 0.5)")).toBe(true);
    });

    it("validates rgb with clamped-out-of-range values", () => {
      // colord parses these as valid even though 300 > 255
      expect(isValidColor("rgb(300, 0, 0)")).toBe(true);
    });
  });

  describe("detectFormat", () => {
    it("detects hex format", () => {
      expect(detectFormat("#ff0000")).toBe("hex");
    });

    it("detects rgb format", () => {
      expect(detectFormat("rgb(255, 0, 0)")).toBe("rgb");
      expect(detectFormat("rgba(255, 0, 0, 0.5)")).toBe("rgb");
    });

    it("detects hsl format", () => {
      expect(detectFormat("hsl(0, 100%, 50%)")).toBe("hsl");
    });

    it("detects hsla as hsl format", () => {
      expect(detectFormat("hsla(120, 50%, 50%, 0.5)")).toBe("hsl");
    });

    it("defaults to hex for named colors", () => {
      expect(detectFormat("red")).toBe("hex");
      expect(detectFormat("transparent")).toBe("hex");
    });

    it("handles leading/trailing whitespace", () => {
      expect(detectFormat("  rgb(255, 0, 0)  ")).toBe("rgb");
      expect(detectFormat("  #ff0000  ")).toBe("hex");
    });

    it("is case-insensitive", () => {
      expect(detectFormat("RGB(255, 0, 0)")).toBe("rgb");
      expect(detectFormat("HSL(0, 100%, 50%)")).toBe("hsl");
    });

    it("detects oklch format", () => {
      expect(detectFormat("oklch(63.7% 0.259 29.23)")).toBe("oklch");
      expect(detectFormat("OKLCH(50% 0.15 180)")).toBe("oklch");
    });

    it("detects oklch with alpha", () => {
      expect(detectFormat("oklch(63.7% 0.259 29.23 / 0.5)")).toBe("oklch");
    });
  });

  describe("formatColor", () => {
    it("converts to hex", () => {
      expect(formatColor("rgb(255, 0, 0)", "hex")).toBe("#ff0000");
    });

    it("converts to rgb", () => {
      expect(formatColor("#ff0000", "rgb")).toBe("rgb(255, 0, 0)");
    });

    it("converts to hsl", () => {
      expect(formatColor("#ff0000", "hsl")).toBe("hsl(0, 100%, 50%)");
    });

    it("converts named colors to hex", () => {
      expect(formatColor("red", "hex")).toBe("#ff0000");
    });

    it("converts named colors to rgb", () => {
      expect(formatColor("blue", "rgb")).toBe("rgb(0, 0, 255)");
    });

    it("preserves alpha when converting to hex", () => {
      const result = formatColor("rgba(255, 0, 0, 0.5)", "hex");
      expect(result).toBe("#ff000080");
    });

    it("preserves alpha when converting to rgb", () => {
      const result = formatColor("#ff000080", "rgb");
      expect(result).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("handles transparent keyword", () => {
      const result = formatColor("transparent", "hex");
      expect(result).toBe("#00000000");
    });

    it("converts hsl to rgb", () => {
      expect(formatColor("hsl(120, 100%, 50%)", "rgb")).toBe("rgb(0, 255, 0)");
    });

    it("converts hex to oklch", () => {
      const result = formatColor("#ff0000", "oklch");
      expect(result).toMatch(/^oklch\(/);
      // Red should have high chroma and hue around 29
      expect(result).toContain("%");
    });

    it("converts oklch to hex", () => {
      const result = formatColor("oklch(62.8% 0.2577 29.23)", "hex");
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("converts oklch to rgb", () => {
      const result = formatColor("oklch(62.8% 0.2577 29.23)", "rgb");
      expect(result).toMatch(/^rgba?\(/);
    });

    it("preserves alpha when converting to oklch", () => {
      const result = formatColor("rgba(255, 0, 0, 0.5)", "oklch");
      expect(result).toMatch(/\/\s*0\.5\)$/);
    });

    it("roundtrips oklch through hex with reasonable accuracy", () => {
      const oklch = "oklch(63.7% 0.259 29.23)";
      const hex = formatColor(oklch, "hex");
      const backToOklch = formatColor(hex, "oklch");
      // Extract lightness from both
      const origL = parseFloat(oklch.match(/oklch\((\d+\.?\d*)%/)?.[1] ?? "0");
      const roundL = parseFloat(backToOklch.match(/oklch\((\d+\.?\d*)%/)?.[1] ?? "0");
      expect(Math.abs(origL - roundL)).toBeLessThan(1);
    });
  });

  describe("toHSVA / fromHSVA roundtrip", () => {
    it("roundtrips a color", () => {
      const original = "#ff0000";
      const hsva = toHSVA(original);
      expect(hsva.h).toBe(0);
      expect(hsva.s).toBe(100);
      expect(hsva.v).toBe(100);
      expect(hsva.a).toBe(1);

      const result = fromHSVA(hsva);
      expect(result).toBe("#ff0000");
    });

    it("roundtrips green", () => {
      const hsva = toHSVA("#00ff00");
      expect(hsva.h).toBe(120);
      expect(hsva.s).toBe(100);
      expect(hsva.v).toBe(100);
      const result = fromHSVA(hsva);
      expect(result).toBe("#00ff00");
    });

    it("roundtrips blue", () => {
      const hsva = toHSVA("#0000ff");
      expect(hsva.h).toBe(240);
      expect(hsva.s).toBe(100);
      expect(hsva.v).toBe(100);
      const result = fromHSVA(hsva);
      expect(result).toBe("#0000ff");
    });

    it("roundtrips white (zero saturation)", () => {
      const hsva = toHSVA("#ffffff");
      expect(hsva.s).toBe(0);
      expect(hsva.v).toBe(100);
      const result = fromHSVA(hsva);
      expect(result).toBe("#ffffff");
    });

    it("roundtrips black (zero value)", () => {
      const hsva = toHSVA("#000000");
      expect(hsva.s).toBe(0);
      expect(hsva.v).toBe(0);
      const result = fromHSVA(hsva);
      expect(result).toBe("#000000");
    });

    it("preserves alpha through roundtrip", () => {
      const hsva = toHSVA("rgba(255, 0, 0, 0.5)");
      expect(hsva.a).toBe(0.5);
      const result = fromHSVA(hsva);
      expect(result).toBe("#ff000080");
    });

    it("handles named colors", () => {
      const hsva = toHSVA("tomato");
      expect(hsva.h).toBeGreaterThan(0);
      expect(hsva.s).toBeGreaterThan(0);
      expect(hsva.v).toBeGreaterThan(0);
    });

    it("handles transparent", () => {
      const hsva = toHSVA("transparent");
      expect(hsva.a).toBe(0);
    });

    it("returns white for invalid input (CSS variable)", () => {
      const hsva = toHSVA("var(--my-color)");
      expect(hsva).toEqual({ h: 0, s: 0, v: 100, a: 1 });
    });

    it("returns white for empty string", () => {
      const hsva = toHSVA("");
      expect(hsva).toEqual({ h: 0, s: 0, v: 100, a: 1 });
    });

    it("returns white for gradient string", () => {
      const hsva = toHSVA("linear-gradient(90deg, #000, #fff)");
      expect(hsva).toEqual({ h: 0, s: 0, v: 100, a: 1 });
    });

    it("returns white for arbitrary non-color string", () => {
      const hsva = toHSVA("not-a-color-at-all");
      expect(hsva).toEqual({ h: 0, s: 0, v: 100, a: 1 });
    });

    it("converts oklch input to HSVA", () => {
      // oklch red-ish color
      const hsva = toHSVA("oklch(62.8% 0.2577 29.23)");
      expect(hsva.s).toBeGreaterThan(50);
      expect(hsva.v).toBeGreaterThan(50);
      expect(hsva.a).toBe(1);
    });

    it("preserves alpha from oklch input", () => {
      const hsva = toHSVA("oklch(62.8% 0.2577 29.23 / 0.5)");
      expect(hsva.a).toBeCloseTo(0.5);
    });
  });

  describe("parseColor", () => {
    it("parses hex colors", () => {
      const c = parseColor("#ff0000");
      expect(c.isValid()).toBe(true);
      expect(c.toHex()).toBe("#ff0000");
    });

    it("parses named colors", () => {
      const c = parseColor("red");
      expect(c.isValid()).toBe(true);
      expect(c.toHex()).toBe("#ff0000");
    });

    it("parses rgba strings", () => {
      const c = parseColor("rgba(128, 128, 128, 0.5)");
      expect(c.isValid()).toBe(true);
      expect(c.alpha()).toBeCloseTo(0.5);
    });
  });

  describe("getContrastColor", () => {
    it("returns black for light backgrounds", () => {
      expect(getContrastColor("#ffffff")).toBe("black");
      expect(getContrastColor("#ffff00")).toBe("black");
    });

    it("returns white for dark backgrounds", () => {
      expect(getContrastColor("#000000")).toBe("white");
      expect(getContrastColor("#000080")).toBe("white");
    });

    it("returns black for light gray", () => {
      expect(getContrastColor("#cccccc")).toBe("black");
    });

    it("returns white for dark gray", () => {
      expect(getContrastColor("#333333")).toBe("white");
    });

    it("handles named colors", () => {
      expect(getContrastColor("white")).toBe("black");
      expect(getContrastColor("black")).toBe("white");
    });
  });

  describe("resolveToken", () => {
    const tokens = { primary: "#3b82f6", brand: "#f97316" };

    it("resolves a token name to its color value", () => {
      expect(resolveToken("primary", tokens)).toBe("#3b82f6");
      expect(resolveToken("brand", tokens)).toBe("#f97316");
    });

    it("returns the input unchanged when not a token", () => {
      expect(resolveToken("#ff0000", tokens)).toBe("#ff0000");
      expect(resolveToken("rgb(255,0,0)", tokens)).toBe("rgb(255,0,0)");
    });

    it("returns the input unchanged when tokens is undefined", () => {
      expect(resolveToken("primary")).toBe("primary");
      expect(resolveToken("#ff0000")).toBe("#ff0000");
    });
  });

  describe("findMatchingToken", () => {
    const tokens = { primary: "#3b82f6", brand: "#f97316" };

    it("finds a matching token by hex value", () => {
      expect(findMatchingToken("#3b82f6", tokens)).toBe("primary");
      expect(findMatchingToken("#f97316", tokens)).toBe("brand");
    });

    it("matches case-insensitively", () => {
      expect(findMatchingToken("#3B82F6", tokens)).toBe("primary");
    });

    it("matches after HSVA roundtrip", () => {
      // The picker internally roundtrips through HSVA, so a slightly shifted
      // hex should still match the original token
      expect(findMatchingToken("#3b82f5", tokens)).toBe("primary");
    });

    it("returns undefined when no token matches", () => {
      expect(findMatchingToken("#ff0000", tokens)).toBeUndefined();
    });

    it("returns undefined when tokens is undefined", () => {
      expect(findMatchingToken("#3b82f6")).toBeUndefined();
    });
  });

  describe("getCSSColorTokens", () => {
    /** Create a mock CSSStyleRule with given selector and properties */
    function makeStyleRule(vars: Record<string, string>, selector: string) {
      const properties = Object.keys(vars);
      const style = {
        length: properties.length,
        [Symbol.iterator]: function* () {
          yield* properties;
        },
      };
      properties.forEach((prop, i) => {
        (style as Record<number, string>)[i] = prop;
      });

      const rule = { selectorText: selector, style };
      Object.setPrototypeOf(rule, CSSStyleRule.prototype);
      return rule;
    }

    /** Create a mock grouping rule (e.g., @layer) containing child rules */
    function makeGroupingRule(childRules: unknown[]) {
      return { cssRules: childRules };
    }

    function mockStyleSheets(
      vars: Record<string, string>,
      selector = ":root",
      options?: { nested?: boolean }
    ) {
      const styleRule = makeStyleRule(vars, selector);
      const rules = options?.nested
        ? [makeGroupingRule([styleRule])]
        : [styleRule];

      Object.defineProperty(document, "styleSheets", {
        value: [{ cssRules: rules }],
        configurable: true,
      });

      // Mock getComputedStyle
      const originalGetComputedStyle = window.getComputedStyle;
      vi.spyOn(window, "getComputedStyle").mockImplementation(() => {
        const result = originalGetComputedStyle(document.documentElement);
        return new Proxy(result, {
          get(target, prop) {
            if (prop === "getPropertyValue") {
              return (name: string) => vars[name] ?? "";
            }
            return (target as unknown as Record<string | symbol, unknown>)[prop];
          },
        });
      });
    }

    afterEach(() => {
      vi.restoreAllMocks();
      Object.defineProperty(document, "styleSheets", {
        value: document.styleSheets,
        configurable: true,
      });
    });

    it("extracts color variables from :root", () => {
      mockStyleSheets({
        "--brand-red": "#ff0000",
        "--brand-blue": "#0000ff",
        "--not-a-color": "24px",
      });

      const tokens = getCSSColorTokens();
      expect(tokens["brand-red"]).toBe("#ff0000");
      expect(tokens["brand-blue"]).toBe("#0000ff");
      expect(tokens["not-a-color"]).toBeUndefined();
    });

    it("filters by prefix and strips it from names", () => {
      mockStyleSheets({
        "--brand-red": "#ff0000",
        "--brand-blue": "#0000ff",
        "--other-green": "#00ff00",
      });

      const tokens = getCSSColorTokens("--brand-");
      expect(tokens["red"]).toBe("#ff0000");
      expect(tokens["blue"]).toBe("#0000ff");
      expect(tokens["other-green"]).toBeUndefined();
      expect(tokens["green"]).toBeUndefined();
    });

    it("returns empty object when no variables exist", () => {
      mockStyleSheets({});
      expect(getCSSColorTokens()).toEqual({});
    });

    it("extracts from html selector", () => {
      mockStyleSheets({ "--color-primary": "#3b82f6" }, "html");
      const tokens = getCSSColorTokens();
      expect(tokens["primary"]).toBe("#3b82f6");
    });

    it("skips internal --cp-* and --tw-* variables by default", () => {
      mockStyleSheets({
        "--cp-bg": "#ffffff",
        "--tw-ring-color": "#3b82f6",
        "--color-accent": "#16db89",
      });

      const tokens = getCSSColorTokens();
      expect(tokens["accent"]).toBe("#16db89");
      expect(tokens["cp-bg"]).toBeUndefined();
      expect(tokens["tw-ring-color"]).toBeUndefined();
    });

    it("includes --cp-* variables when explicitly requested via prefix", () => {
      mockStyleSheets({
        "--cp-bg": "#ffffff",
        "--cp-text": "#171717",
      });

      const tokens = getCSSColorTokens("--cp-");
      expect(tokens["bg"]).toBe("#ffffff");
      expect(tokens["text"]).toBe("#171717");
    });

    it("extracts from compound selectors containing :root", () => {
      mockStyleSheets({ "--color-primary": "#3b82f6" }, ":root, :host");
      const tokens = getCSSColorTokens();
      expect(tokens["primary"]).toBe("#3b82f6");
    });

    it("extracts from nested rules (e.g., @layer)", () => {
      mockStyleSheets(
        { "--color-accent": "#16db89" },
        ":root",
        { nested: true }
      );
      const tokens = getCSSColorTokens();
      expect(tokens["accent"]).toBe("#16db89");
    });

    it("returns empty object in SSR (no document)", () => {
      const origDoc = globalThis.document;
      // @ts-expect-error -- simulating SSR
      delete globalThis.document;
      try {
        expect(getCSSColorTokens()).toEqual({});
      } finally {
        globalThis.document = origDoc;
      }
    });
  });
});
