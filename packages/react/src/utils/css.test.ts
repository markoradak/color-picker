import { describe, expect, it } from "vitest";
import { fromCSS, isGradient, isSolidColor, toCSS } from "./css";
import type { GradientValue } from "../types";

describe("css utilities", () => {
  describe("type guards", () => {
    it("identifies solid colors", () => {
      expect(isSolidColor("#ff0000")).toBe(true);
      expect(isSolidColor("rgb(255, 0, 0)")).toBe(true);
    });

    it("identifies named colors as solid", () => {
      expect(isSolidColor("red")).toBe(true);
      expect(isSolidColor("transparent")).toBe(true);
    });

    it("identifies gradients", () => {
      const gradient: GradientValue = {
        type: "linear",
        angle: 90,
        stops: [
          { id: "1", color: "#000", position: 0 },
          { id: "2", color: "#fff", position: 100 },
        ],
      };
      expect(isGradient(gradient)).toBe(true);
      expect(isGradient("#ff0000")).toBe(false);
    });

    it("rejects null and undefined as gradient", () => {
      expect(isGradient(null as unknown as string)).toBe(false);
      expect(isGradient(undefined as unknown as string)).toBe(false);
    });

    it("rejects objects without type or stops as gradient", () => {
      expect(isGradient({ type: "linear" } as unknown as GradientValue)).toBe(false);
      expect(isGradient({ stops: [] } as unknown as GradientValue)).toBe(false);
    });
  });

  describe("toCSS", () => {
    it("returns solid colors as-is", () => {
      expect(toCSS("#ff0000")).toBe("#ff0000");
    });

    it("returns named colors as-is", () => {
      expect(toCSS("red")).toBe("red");
    });

    it("generates linear gradient CSS", () => {
      const gradient: GradientValue = {
        type: "linear",
        angle: 90,
        stops: [
          { id: "1", color: "#000", position: 0 },
          { id: "2", color: "#fff", position: 100 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "linear-gradient(90deg, #000 0%, #fff 100%)"
      );
    });

    it("generates linear gradient with default angle when missing", () => {
      const gradient: GradientValue = {
        type: "linear",
        stops: [
          { id: "1", color: "#000", position: 0 },
          { id: "2", color: "#fff", position: 100 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "linear-gradient(90deg, #000 0%, #fff 100%)"
      );
    });

    it("generates radial gradient CSS", () => {
      const gradient: GradientValue = {
        type: "radial",
        centerX: 50,
        centerY: 50,
        stops: [
          { id: "1", color: "red", position: 0 },
          { id: "2", color: "blue", position: 100 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "radial-gradient(circle at 50% 50%, red 0%, blue 100%)"
      );
    });

    it("generates radial gradient with default center when missing", () => {
      const gradient: GradientValue = {
        type: "radial",
        stops: [
          { id: "1", color: "red", position: 0 },
          { id: "2", color: "blue", position: 100 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "radial-gradient(circle at 50% 50%, red 0%, blue 100%)"
      );
    });

    it("generates conic gradient CSS", () => {
      const gradient: GradientValue = {
        type: "conic",
        angle: 0,
        centerX: 50,
        centerY: 50,
        stops: [
          { id: "1", color: "red", position: 0 },
          { id: "2", color: "blue", position: 100 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "conic-gradient(from 0deg at 50% 50%, red 0%, blue 100%)"
      );
    });

    it("generates conic gradient with non-zero angle", () => {
      const gradient: GradientValue = {
        type: "conic",
        angle: 45,
        centerX: 25,
        centerY: 75,
        stops: [
          { id: "1", color: "#f00", position: 0 },
          { id: "2", color: "#0f0", position: 50 },
          { id: "3", color: "#00f", position: 100 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "conic-gradient(from 45deg at 25% 75%, #f00 0%, #0f0 50%, #00f 100%)"
      );
    });

    it("generates mesh gradient as layered radial gradients", () => {
      const gradient: GradientValue = {
        type: "mesh",
        stops: [
          { id: "1", color: "red", position: 0, x: 25, y: 25 },
          { id: "2", color: "blue", position: 100, x: 75, y: 75 },
        ],
      };
      const result = toCSS(gradient);
      expect(result).toContain("radial-gradient(circle at 25% 25%, red 0%, transparent 50%)");
      expect(result).toContain("radial-gradient(circle at 75% 75%, blue 0%, transparent 50%)");
    });

    it("appends baseColor as the last background layer for mesh gradients", () => {
      const gradient: GradientValue = {
        type: "mesh",
        baseColor: "#ffffff",
        stops: [
          { id: "1", color: "red", position: 0, x: 25, y: 25 },
          { id: "2", color: "blue", position: 100, x: 75, y: 75 },
        ],
      };
      const result = toCSS(gradient);
      expect(result).toContain("radial-gradient(circle at 25% 25%, red 0%, transparent 50%)");
      expect(result).toContain("radial-gradient(circle at 75% 75%, blue 0%, transparent 50%)");
      // baseColor should be the last layer
      expect(result).toMatch(/, #ffffff$/);
    });

    it("does not append baseColor when not set on mesh gradient", () => {
      const gradient: GradientValue = {
        type: "mesh",
        stops: [
          { id: "1", color: "red", position: 0, x: 25, y: 25 },
        ],
      };
      const result = toCSS(gradient);
      expect(result).not.toContain("#ffffff");
      expect(result).toBe("radial-gradient(circle at 25% 25%, red 0%, transparent 50%)");
    });

    it("sorts stops by position before generating CSS", () => {
      const gradient: GradientValue = {
        type: "linear",
        angle: 90,
        stops: [
          { id: "2", color: "#fff", position: 100 },
          { id: "1", color: "#000", position: 0 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "linear-gradient(90deg, #000 0%, #fff 100%)"
      );
    });

    it("handles gradient with three stops", () => {
      const gradient: GradientValue = {
        type: "linear",
        angle: 180,
        stops: [
          { id: "1", color: "red", position: 0 },
          { id: "2", color: "green", position: 50 },
          { id: "3", color: "blue", position: 100 },
        ],
      };
      expect(toCSS(gradient)).toBe(
        "linear-gradient(180deg, red 0%, green 50%, blue 100%)"
      );
    });
  });

  describe("fromCSS", () => {
    it("returns solid color strings as-is", () => {
      expect(fromCSS("#ff0000")).toBe("#ff0000");
      expect(fromCSS("red")).toBe("red");
      expect(fromCSS("rgb(255, 0, 0)")).toBe("rgb(255, 0, 0)");
    });

    it("trims whitespace from input", () => {
      expect(fromCSS("  #ff0000  ")).toBe("#ff0000");
    });

    it("returns gradient strings as fallback (parsing not yet implemented)", () => {
      const input = "linear-gradient(90deg, #000 0%, #fff 100%)";
      const result = fromCSS(input);
      // fromCSS currently returns the raw string for gradients
      expect(typeof result).toBe("string");
    });
  });
});
