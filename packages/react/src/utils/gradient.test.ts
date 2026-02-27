import { describe, expect, it } from "vitest";
import {
  addStop,
  addStopWithCoordinates,
  createDefaultGradient,
  createGradientStop,
  interpolateColorAt,
  removeStop,
  sortStops,
  updateStop,
} from "./gradient";
import type { GradientStop, GradientValue } from "../types";

describe("gradient utilities", () => {
  describe("createGradientStop", () => {
    it("creates a stop with an id", () => {
      const stop = createGradientStop("#ff0000", 50);
      expect(stop.id).toBeTruthy();
      expect(stop.color).toBe("#ff0000");
      expect(stop.position).toBe(50);
    });

    it("clamps position to 0-100", () => {
      expect(createGradientStop("#000", -10).position).toBe(0);
      expect(createGradientStop("#000", 150).position).toBe(100);
    });
  });

  describe("sortStops", () => {
    it("sorts stops by position ascending", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#000", position: 80 },
        { id: "b", color: "#fff", position: 20 },
        { id: "c", color: "#888", position: 50 },
      ];
      const sorted = sortStops(stops);
      expect(sorted.map((s) => s.position)).toEqual([20, 50, 80]);
    });

    it("does not mutate the original array", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#000", position: 80 },
        { id: "b", color: "#fff", position: 20 },
      ];
      sortStops(stops);
      expect(stops[0]!.position).toBe(80);
    });
  });

  describe("addStop", () => {
    it("adds a stop and sorts", () => {
      const gradient = createDefaultGradient("linear");
      const updated = addStop(gradient, "#ff0000", 50);
      expect(updated.stops.length).toBe(3);
      expect(updated.stops[1]!.color).toBe("#ff0000");
      expect(updated.stops[1]!.position).toBe(50);
    });
  });

  describe("addStopWithCoordinates", () => {
    it("adds a stop with x and y coordinates", () => {
      const gradient = createDefaultGradient("mesh");
      const updated = addStopWithCoordinates(gradient, "#ff0000", 50, 30, 70);
      expect(updated.stops.length).toBe(3);
      const newStop = updated.stops.find((s) => s.color === "#ff0000");
      expect(newStop).toBeDefined();
      expect(newStop!.x).toBe(30);
      expect(newStop!.y).toBe(70);
      expect(newStop!.position).toBe(50);
    });
  });

  describe("removeStop", () => {
    it("removes a stop by id", () => {
      const gradient = createDefaultGradient("linear");
      const extra = addStop(gradient, "#ff0000", 50);
      expect(extra.stops.length).toBe(3);
      const removed = removeStop(extra, extra.stops[1]!.id);
      expect(removed.stops.length).toBe(2);
    });

    it("does not remove below minimum of 2 stops", () => {
      const gradient = createDefaultGradient("linear");
      expect(gradient.stops.length).toBe(2);
      const result = removeStop(gradient, gradient.stops[0]!.id);
      expect(result.stops.length).toBe(2);
    });
  });

  describe("updateStop", () => {
    it("updates stop properties", () => {
      const gradient = createDefaultGradient("linear");
      const stopId = gradient.stops[0]!.id;
      const updated = updateStop(gradient, stopId, { color: "#ff0000", position: 25 });
      const stop = updated.stops.find((s) => s.id === stopId);
      expect(stop!.color).toBe("#ff0000");
      expect(stop!.position).toBe(25);
    });
  });

  describe("interpolateColorAt", () => {
    it("returns the first stop color when position is before all stops", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#000000", position: 20 },
        { id: "b", color: "#ffffff", position: 80 },
      ];
      expect(interpolateColorAt(stops, 10)).toBe("#000000");
    });

    it("returns the last stop color when position is after all stops", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#000000", position: 20 },
        { id: "b", color: "#ffffff", position: 80 },
      ];
      expect(interpolateColorAt(stops, 90)).toBe("#ffffff");
    });

    it("returns a mixed color at the midpoint", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#000000", position: 0 },
        { id: "b", color: "#ffffff", position: 100 },
      ];
      const mid = interpolateColorAt(stops, 50);
      // Should be approximately gray
      expect(mid).toMatch(/^#[0-9a-f]{6}$/);
      // The exact value depends on colord's mix algorithm, but it should be in the gray range
      expect(mid).not.toBe("#000000");
      expect(mid).not.toBe("#ffffff");
    });

    it("returns gray for empty stops", () => {
      expect(interpolateColorAt([], 50)).toBe("#808080");
    });

    it("returns the only stop color for single stop", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#ff0000", position: 50 },
      ];
      expect(interpolateColorAt(stops, 25)).toBe("#ff0000");
    });
  });

  describe("createDefaultGradient", () => {
    it("creates a linear gradient with angle", () => {
      const g = createDefaultGradient("linear");
      expect(g.type).toBe("linear");
      expect(g.angle).toBe(90);
      expect(g.stops.length).toBe(2);
    });

    it("creates a radial gradient with center", () => {
      const g = createDefaultGradient("radial");
      expect(g.type).toBe("radial");
      expect(g.centerX).toBe(50);
      expect(g.centerY).toBe(50);
    });

    it("creates a conic gradient with angle and center", () => {
      const g = createDefaultGradient("conic");
      expect(g.type).toBe("conic");
      expect(g.angle).toBe(0);
      expect(g.centerX).toBe(50);
      expect(g.centerY).toBe(50);
    });

    it("creates a mesh gradient with x, y coordinates", () => {
      const g = createDefaultGradient("mesh");
      expect(g.type).toBe("mesh");
      expect(g.stops[0]!.x).toBe(25);
      expect(g.stops[0]!.y).toBe(25);
      expect(g.stops[1]!.x).toBe(75);
      expect(g.stops[1]!.y).toBe(75);
    });
  });
});
