import { describe, expect, it } from "vitest";
import { angleFromPosition, clamp, getRelativePosition } from "./position";

describe("position utilities", () => {
  describe("clamp", () => {
    it("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("clamps to minimum", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("clamps to maximum", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("returns min when value equals min", () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it("returns max when value equals max", () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("handles negative ranges", () => {
      expect(clamp(0, -10, -5)).toBe(-5);
      expect(clamp(-7, -10, -5)).toBe(-7);
      expect(clamp(-15, -10, -5)).toBe(-10);
    });

    it("handles zero-width range", () => {
      expect(clamp(5, 5, 5)).toBe(5);
      expect(clamp(0, 5, 5)).toBe(5);
      expect(clamp(10, 5, 5)).toBe(5);
    });

    it("handles decimal values", () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5);
      expect(clamp(-0.1, 0, 1)).toBe(0);
      expect(clamp(1.1, 0, 1)).toBe(1);
    });
  });

  describe("getRelativePosition", () => {
    it("returns normalized position within element", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          right: 300,
          bottom: 300,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 200, clientY: 200 },
        element
      );
      expect(result.x).toBe(0.5);
      expect(result.y).toBe(0.5);
    });

    it("clamps to 0 when pointer is before element", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          right: 300,
          bottom: 300,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 50, clientY: 50 },
        element
      );
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("clamps to 1 when pointer is after element", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          right: 300,
          bottom: 300,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 400, clientY: 400 },
        element
      );
      expect(result.x).toBe(1);
      expect(result.y).toBe(1);
    });

    it("returns 0,0 at top-left corner", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          right: 300,
          bottom: 300,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 100, clientY: 100 },
        element
      );
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("returns 1,1 at bottom-right corner", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          right: 300,
          bottom: 300,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 300, clientY: 300 },
        element
      );
      expect(result.x).toBe(1);
      expect(result.y).toBe(1);
    });

    it("returns 0,0 when element has zero width", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 0,
          height: 200,
          right: 100,
          bottom: 300,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 150, clientY: 200 },
        element
      );
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("returns 0,0 when element has zero height", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 200,
          height: 0,
          right: 300,
          bottom: 100,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 200, clientY: 150 },
        element
      );
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("returns 0,0 when element has zero width and height", () => {
      const element = {
        getBoundingClientRect: () => ({
          left: 100,
          top: 100,
          width: 0,
          height: 0,
          right: 100,
          bottom: 100,
          x: 100,
          y: 100,
          toJSON: () => {},
        }),
      } as HTMLElement;

      const result = getRelativePosition(
        { clientX: 150, clientY: 200 },
        element
      );
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe("angleFromPosition", () => {
    it("returns 0 degrees for position directly above center", () => {
      // Above center: x=50, y=0, center at 50,50
      const angle = angleFromPosition(50, 0, 50, 50);
      expect(angle).toBeCloseTo(0, 0);
    });

    it("returns 90 degrees for position directly right of center", () => {
      const angle = angleFromPosition(100, 50, 50, 50);
      expect(angle).toBeCloseTo(90, 0);
    });

    it("returns 180 degrees for position directly below center", () => {
      const angle = angleFromPosition(50, 100, 50, 50);
      expect(angle).toBeCloseTo(180, 0);
    });

    it("returns 270 degrees for position directly left of center", () => {
      const angle = angleFromPosition(0, 50, 50, 50);
      expect(angle).toBeCloseTo(270, 0);
    });

    it("returns value in 0-360 range", () => {
      // Test various positions to ensure the result is always 0-360
      const positions = [
        [0, 0],
        [100, 0],
        [100, 100],
        [0, 100],
        [50, 50],
        [75, 25],
        [25, 75],
      ] as const;

      for (const [x, y] of positions) {
        const angle = angleFromPosition(x, y, 50, 50);
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThan(360);
      }
    });

    it("returns 45 degrees for diagonal upper-right", () => {
      const angle = angleFromPosition(100, 0, 50, 50);
      expect(angle).toBeCloseTo(45, 0);
    });
  });
});
