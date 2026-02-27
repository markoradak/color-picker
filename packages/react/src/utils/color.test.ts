import { describe, expect, it } from "vitest";
import {
  detectFormat,
  formatColor,
  fromHSVA,
  getContrastColor,
  isValidColor,
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
  });
});
