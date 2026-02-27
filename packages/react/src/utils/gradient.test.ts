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

    it("clamps position at exact boundaries", () => {
      expect(createGradientStop("#000", 0).position).toBe(0);
      expect(createGradientStop("#000", 100).position).toBe(100);
    });

    it("generates unique ids for each stop", () => {
      const stop1 = createGradientStop("#000", 0);
      const stop2 = createGradientStop("#000", 0);
      expect(stop1.id).not.toBe(stop2.id);
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

    it("handles stops at the same position", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#000", position: 50 },
        { id: "b", color: "#fff", position: 50 },
      ];
      const sorted = sortStops(stops);
      expect(sorted.length).toBe(2);
      expect(sorted[0]!.position).toBe(50);
      expect(sorted[1]!.position).toBe(50);
    });

    it("handles empty array", () => {
      const sorted = sortStops([]);
      expect(sorted).toEqual([]);
    });

    it("handles single stop", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#000", position: 50 },
      ];
      const sorted = sortStops(stops);
      expect(sorted.length).toBe(1);
      expect(sorted[0]!.position).toBe(50);
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

    it("adds a stop at position 0 (boundary)", () => {
      const gradient = createDefaultGradient("linear");
      const updated = addStop(gradient, "#ff0000", 0);
      expect(updated.stops.length).toBe(3);
      // The new stop and the existing stop at 0 should both be at 0
      const stopsAtZero = updated.stops.filter((s) => s.position === 0);
      expect(stopsAtZero.length).toBe(2);
    });

    it("adds a stop at position 100 (boundary)", () => {
      const gradient = createDefaultGradient("linear");
      const updated = addStop(gradient, "#ff0000", 100);
      expect(updated.stops.length).toBe(3);
      const stopsAtHundred = updated.stops.filter((s) => s.position === 100);
      expect(stopsAtHundred.length).toBe(2);
    });

    it("does not mutate the original gradient", () => {
      const gradient = createDefaultGradient("linear");
      const originalLength = gradient.stops.length;
      addStop(gradient, "#ff0000", 50);
      expect(gradient.stops.length).toBe(originalLength);
    });

    it("preserves other gradient properties", () => {
      const gradient = createDefaultGradient("linear");
      const updated = addStop(gradient, "#ff0000", 50);
      expect(updated.type).toBe("linear");
      expect(updated.angle).toBe(90);
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

    it("preserves existing stops", () => {
      const gradient = createDefaultGradient("mesh");
      const existing0 = gradient.stops[0]!;
      const updated = addStopWithCoordinates(gradient, "#ff0000", 50, 30, 70);
      const preserved = updated.stops.find((s) => s.id === existing0.id);
      expect(preserved).toBeDefined();
      expect(preserved!.x).toBe(existing0.x);
      expect(preserved!.y).toBe(existing0.y);
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

    it("returns the same gradient object when at minimum stops", () => {
      const gradient = createDefaultGradient("linear");
      const result = removeStop(gradient, gradient.stops[0]!.id);
      expect(result).toBe(gradient);
    });

    it("handles removing a non-existent stop id gracefully", () => {
      const gradient = createDefaultGradient("linear");
      const extra = addStop(gradient, "#ff0000", 50);
      const result = removeStop(extra, "non-existent-id");
      // The filter won't match anything, so all stops remain
      expect(result.stops.length).toBe(3);
    });

    it("preserves gradient properties when removing", () => {
      const gradient = createDefaultGradient("linear");
      const extra = addStop(gradient, "#ff0000", 50);
      const removed = removeStop(extra, extra.stops[1]!.id);
      expect(removed.type).toBe("linear");
      expect(removed.angle).toBe(90);
    });

    it("does not mutate the original gradient", () => {
      const gradient = createDefaultGradient("linear");
      const extra = addStop(gradient, "#ff0000", 50);
      const originalLength = extra.stops.length;
      removeStop(extra, extra.stops[1]!.id);
      expect(extra.stops.length).toBe(originalLength);
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

    it("only updates specified properties", () => {
      const gradient = createDefaultGradient("linear");
      const stopId = gradient.stops[0]!.id;
      const originalColor = gradient.stops[0]!.color;
      const updated = updateStop(gradient, stopId, { position: 25 });
      const stop = updated.stops.find((s) => s.id === stopId);
      expect(stop!.color).toBe(originalColor);
      expect(stop!.position).toBe(25);
    });

    it("does not affect other stops", () => {
      const gradient = createDefaultGradient("linear");
      const stopId0 = gradient.stops[0]!.id;
      const stopId1 = gradient.stops[1]!.id;
      const originalStop1 = { ...gradient.stops[1]! };
      const updated = updateStop(gradient, stopId0, { color: "#ff0000" });
      const stop1 = updated.stops.find((s) => s.id === stopId1);
      expect(stop1!.color).toBe(originalStop1.color);
      expect(stop1!.position).toBe(originalStop1.position);
    });

    it("can update x and y coordinates for mesh stops", () => {
      const gradient = createDefaultGradient("mesh");
      const stopId = gradient.stops[0]!.id;
      const updated = updateStop(gradient, stopId, { x: 10, y: 90 });
      const stop = updated.stops.find((s) => s.id === stopId);
      expect(stop!.x).toBe(10);
      expect(stop!.y).toBe(90);
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

    it("returns exact stop color at stop position", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#ff0000", position: 0 },
        { id: "b", color: "#0000ff", position: 100 },
      ];
      expect(interpolateColorAt(stops, 0)).toBe("#ff0000");
      expect(interpolateColorAt(stops, 100)).toBe("#0000ff");
    });

    it("interpolates between three stops correctly", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#ff0000", position: 0 },
        { id: "b", color: "#00ff00", position: 50 },
        { id: "c", color: "#0000ff", position: 100 },
      ];
      // At position 25, should be between red and green
      const color25 = interpolateColorAt(stops, 25);
      expect(color25).toMatch(/^#[0-9a-f]{6}$/);
      // At position 75, should be between green and blue
      const color75 = interpolateColorAt(stops, 75);
      expect(color75).toMatch(/^#[0-9a-f]{6}$/);
      // They should be different
      expect(color25).not.toBe(color75);
    });

    it("handles unsorted stops (sorts internally)", () => {
      const stops: GradientStop[] = [
        { id: "b", color: "#ffffff", position: 100 },
        { id: "a", color: "#000000", position: 0 },
      ];
      const mid = interpolateColorAt(stops, 50);
      expect(mid).toMatch(/^#[0-9a-f]{6}$/);
      expect(mid).not.toBe("#000000");
      expect(mid).not.toBe("#ffffff");
    });

    it("handles stops at the same position", () => {
      const stops: GradientStop[] = [
        { id: "a", color: "#ff0000", position: 50 },
        { id: "b", color: "#0000ff", position: 50 },
      ];
      // Should not throw, should return one of the colors
      const result = interpolateColorAt(stops, 50);
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
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

    it("defaults to linear when no type specified", () => {
      const g = createDefaultGradient();
      expect(g.type).toBe("linear");
      expect(g.angle).toBe(90);
    });

    it("always creates two stops (black and white)", () => {
      const types = ["linear", "radial", "conic", "mesh"] as const;
      for (const type of types) {
        const g = createDefaultGradient(type);
        expect(g.stops.length).toBe(2);
        expect(g.stops[0]!.color).toBe("#000000");
        expect(g.stops[1]!.color).toBe("#ffffff");
      }
    });

    it("assigns unique ids to each stop", () => {
      const g = createDefaultGradient("linear");
      expect(g.stops[0]!.id).not.toBe(g.stops[1]!.id);
    });

    it("assigns positions 0 and 100 to default stops", () => {
      const g = createDefaultGradient("linear");
      expect(g.stops[0]!.position).toBe(0);
      expect(g.stops[1]!.position).toBe(100);
    });
  });
});
