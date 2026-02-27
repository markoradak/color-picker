import { describe, expect, it } from "vitest";
import { isGradient, isSolidColor, toCSS } from "./css";
import type { GradientValue } from "../types";

describe("css utilities", () => {
  describe("type guards", () => {
    it("identifies solid colors", () => {
      expect(isSolidColor("#ff0000")).toBe(true);
      expect(isSolidColor("rgb(255, 0, 0)")).toBe(true);
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
  });

  describe("toCSS", () => {
    it("returns solid colors as-is", () => {
      expect(toCSS("#ff0000")).toBe("#ff0000");
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
  });
});
