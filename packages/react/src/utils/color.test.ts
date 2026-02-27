import { describe, expect, it } from "vitest";
import {
  detectFormat,
  formatColor,
  fromHSVA,
  getContrastColor,
  isValidColor,
  parseColor,
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
});
