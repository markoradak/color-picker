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

    it("parses linear-gradient with angle and stops", () => {
      const result = fromCSS("linear-gradient(90deg, #000 0%, #fff 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.type).toBe("linear");
        expect(result.angle).toBe(90);
        expect(result.stops).toHaveLength(2);
        expect(result.stops[0]!.color).toBe("#000");
        expect(result.stops[0]!.position).toBe(0);
        expect(result.stops[1]!.color).toBe("#fff");
        expect(result.stops[1]!.position).toBe(100);
      }
    });

    it("parses linear-gradient with direction keyword", () => {
      const result = fromCSS("linear-gradient(to right, red 0%, blue 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.type).toBe("linear");
        expect(result.angle).toBe(90);
      }
    });

    it("parses linear-gradient with three stops", () => {
      const result = fromCSS("linear-gradient(180deg, red 0%, green 50%, blue 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.stops).toHaveLength(3);
        expect(result.stops[1]!.color).toBe("green");
        expect(result.stops[1]!.position).toBe(50);
      }
    });

    it("parses linear-gradient with rgb() color stops", () => {
      const result = fromCSS("linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.stops[0]!.color).toBe("rgb(255, 0, 0)");
        expect(result.stops[1]!.color).toBe("rgb(0, 0, 255)");
      }
    });

    it("parses radial-gradient with circle at position", () => {
      const result = fromCSS("radial-gradient(circle at 50% 50%, red 0%, blue 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.type).toBe("radial");
        expect(result.centerX).toBe(50);
        expect(result.centerY).toBe(50);
        expect(result.stops).toHaveLength(2);
      }
    });

    it("parses radial-gradient with custom center", () => {
      const result = fromCSS("radial-gradient(circle at 25% 75%, #f00 0%, #0f0 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.centerX).toBe(25);
        expect(result.centerY).toBe(75);
      }
    });

    it("parses conic-gradient with angle and position", () => {
      const result = fromCSS("conic-gradient(from 45deg at 50% 50%, red 0%, blue 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.type).toBe("conic");
        expect(result.angle).toBe(45);
        expect(result.centerX).toBe(50);
        expect(result.centerY).toBe(50);
        expect(result.stops).toHaveLength(2);
      }
    });

    it("parses conic-gradient with only angle", () => {
      const result = fromCSS("conic-gradient(from 90deg, red 0%, blue 100%)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.type).toBe("conic");
        expect(result.angle).toBe(90);
      }
    });

    it("auto-distributes stop positions when not specified", () => {
      const result = fromCSS("linear-gradient(90deg, red, green, blue)");
      expect(isGradient(result)).toBe(true);
      if (isGradient(result)) {
        expect(result.stops).toHaveLength(3);
        expect(result.stops[0]!.position).toBe(0);
        expect(result.stops[1]!.position).toBe(50);
        expect(result.stops[2]!.position).toBe(100);
      }
    });

    it("returns raw string for unparseable gradient content", () => {
      // A gradient with only one stop can't form a valid GradientValue
      const result = fromCSS("linear-gradient(90deg, red)");
      expect(typeof result).toBe("string");
    });

    it("roundtrips through toCSS and fromCSS for linear gradients", () => {
      const original: GradientValue = {
        type: "linear",
        angle: 135,
        stops: [
          { id: "1", color: "red", position: 0 },
          { id: "2", color: "blue", position: 100 },
        ],
      };
      const css = toCSS(original);
      const parsed = fromCSS(css);
      expect(isGradient(parsed)).toBe(true);
      if (isGradient(parsed)) {
        expect(parsed.type).toBe("linear");
        expect(parsed.angle).toBe(135);
        expect(parsed.stops).toHaveLength(2);
        expect(parsed.stops[0]!.color).toBe("red");
        expect(parsed.stops[0]!.position).toBe(0);
        expect(parsed.stops[1]!.color).toBe("blue");
        expect(parsed.stops[1]!.position).toBe(100);
      }
    });

    it("roundtrips through toCSS and fromCSS for radial gradients", () => {
      const original: GradientValue = {
        type: "radial",
        centerX: 30,
        centerY: 70,
        stops: [
          { id: "1", color: "#ff0000", position: 0 },
          { id: "2", color: "#0000ff", position: 100 },
        ],
      };
      const css = toCSS(original);
      const parsed = fromCSS(css);
      expect(isGradient(parsed)).toBe(true);
      if (isGradient(parsed)) {
        expect(parsed.type).toBe("radial");
        expect(parsed.centerX).toBe(30);
        expect(parsed.centerY).toBe(70);
      }
    });

    it("roundtrips through toCSS and fromCSS for conic gradients", () => {
      const original: GradientValue = {
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
      const css = toCSS(original);
      const parsed = fromCSS(css);
      expect(isGradient(parsed)).toBe(true);
      if (isGradient(parsed)) {
        expect(parsed.type).toBe("conic");
        expect(parsed.angle).toBe(45);
        expect(parsed.centerX).toBe(25);
        expect(parsed.centerY).toBe(75);
        expect(parsed.stops).toHaveLength(3);
      }
    });
  });
});
