import { forwardRef, useId, useMemo } from "react";
import { useColorPickerContext } from "./color-picker-context";
import { hsvLuminance, contrastFromLuminances, colorLuminance } from "../utils/color";

/**
 * Props for the ColorPickerContrastLine component.
 */
export interface ColorPickerContrastLineProps {
  /** The background/reference color to compute contrast against. */
  contrastColor: string;
  /** WCAG contrast ratio threshold for the line. Default: 4.5 (AA normal text). */
  threshold?: number;
  /** CSS class for the SVG element. */
  className?: string;
  /** Stroke color for the line. Default: "rgba(255,255,255,0.8)". */
  stroke?: string;
  /** Stroke width in SVG units. Default: 1.5. */
  strokeWidth?: number;
  /** Show dot pattern in the insufficient-contrast region. Default: true. */
  showDots?: boolean;
}

/** Number of sample points across the saturation axis. */
const SAMPLES = 50;

/**
 * SVG overlay for the ColorPicker.Area that draws a curve along the
 * WCAG contrast-ratio threshold boundary, with an optional dot pattern
 * filling the region that has insufficient contrast.
 *
 * Place this as a child of `<ColorPicker.Area>` between the gradient
 * and thumb:
 *
 * ```tsx
 * <ColorPicker.Area>
 *   <ColorPicker.AreaGradient />
 *   <ColorPickerContrastLine contrastColor="#ffffff" />
 *   <ColorPicker.AreaThumb />
 * </ColorPicker.Area>
 * ```
 */
export const ColorPickerContrastLine = forwardRef<
  SVGSVGElement,
  ColorPickerContrastLineProps
>(function ColorPickerContrastLine(
  {
    contrastColor,
    threshold = 4.5,
    className,
    stroke = "rgba(255,255,255,0.8)",
    strokeWidth = 1.5,
    showDots = true,
  },
  ref,
) {
  const { hsva } = useColorPickerContext();
  const clipId = useId();

  const result = useMemo(() => {
    const bgLum = colorLuminance(contrastColor);

    // Determine which side of the line fails:
    // Check white corner (s=0, v=100 → top-left of area).
    // If white fails against the contrast color, light colors (top region) fail.
    const whiteLum = hsvLuminance(hsva.h, 0, 100, hsva.a);
    const whiteRatio = contrastFromLuminances(whiteLum, bgLum);
    const failAbove = whiteRatio < threshold;

    // Compute line points AND boundary points for the fill region.
    // Line points: only where a threshold crossing exists (for the visible line).
    // Boundary points: for every sample (for the fill region).
    //   - If crossing exists: use crossing y
    //   - If no crossing: extend to the appropriate edge
    const linePoints: { x: number; y: number }[] = [];
    const boundaryPoints: { x: number; y: number }[] = [];

    for (let i = 0; i <= SAMPLES; i++) {
      const sat = (i / SAMPLES) * 100;
      const val = findThresholdValue(hsva.h, sat, hsva.a, bgLum, threshold);

      if (val !== null) {
        const y = 100 - val;
        linePoints.push({ x: sat, y });
        boundaryPoints.push({ x: sat, y });
      } else {
        // No crossing — entire column is on one side.
        // Check if column's midpoint fails.
        const midLum = hsvLuminance(hsva.h, sat, 50, hsva.a);
        const midRatio = contrastFromLuminances(midLum, bgLum);
        const columnFails = midRatio < threshold;

        // If column fails: extend boundary to the opposite edge (full fail area).
        // If column passes: boundary at the fail-side edge (zero fill area).
        const y = columnFails
          ? (failAbove ? 100 : 0)
          : (failAbove ? 0 : 100);
        boundaryPoints.push({ x: sat, y });
      }
    }

    if (linePoints.length < 2) return null;

    const linePath = pointsToSmoothPath(linePoints);

    // Build closed fill path for the fail region.
    // The boundary goes from x=0 to x=100. Close it by going along the fail-side edge.
    const failEdgeY = failAbove ? 0 : 100;
    const lastBound = boundaryPoints[boundaryPoints.length - 1]!;
    const fillParts = pointsToSmoothPath(boundaryPoints);
    const fillPath = `${fillParts}L${lastBound.x},${failEdgeY}L0,${failEdgeY}Z`;

    // Scale fill path coordinates to 0-1 for objectBoundingBox clipPath.
    const clipBoundary = boundaryPoints.map((p) => ({
      x: p.x / 100,
      y: p.y / 100,
    }));
    const clipEdgeY = failEdgeY / 100;
    const lastClip = clipBoundary[clipBoundary.length - 1]!;
    const clipParts = pointsToSmoothPath(clipBoundary);
    const clipPath = `${clipParts}L${lastClip.x},${clipEdgeY}L0,${clipEdgeY}Z`;

    return { linePath, fillPath, clipPath };
  }, [hsva.h, hsva.a, contrastColor, threshold]);

  if (!result) return null;

  return (
    <>
      {/* Dot pattern in the insufficient-contrast region */}
      {showDots && (
        <>
          <svg
            style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
            aria-hidden="true"
          >
            <defs>
              <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                <path d={result.clipPath} />
              </clipPath>
            </defs>
          </svg>
          <div
            data-cp-el="contrast-dots"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `url(#${clipId})`,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.35) 0.75px, transparent 0.75px)",
              backgroundSize: "6px 6px",
              backgroundPosition: "3px 3px",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {/* Contrast threshold line */}
      <svg
        ref={ref}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-cp-el="contrast-line"
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <path
          d={result.linePath}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </>
  );
});

/**
 * Binary-search for the brightness (value 0-100) at which the contrast
 * ratio between HSV(h, s, v, a) and the background luminance equals
 * the target threshold. Returns null if the threshold is unreachable.
 */
function findThresholdValue(
  h: number,
  s: number,
  a: number,
  bgLum: number,
  target: number,
): number | null {
  const ratioAtMin = contrastFromLuminances(hsvLuminance(h, s, 0, a), bgLum);
  const ratioAtMax = contrastFromLuminances(hsvLuminance(h, s, 100, a), bgLum);

  const minAbove = ratioAtMin >= target;
  const maxAbove = ratioAtMax >= target;
  if (minAbove === maxAbove) return null;

  let lo = 0;
  let hi = 100;

  for (let iter = 0; iter < 20; iter++) {
    const mid = (lo + hi) / 2;
    const lum = hsvLuminance(h, s, mid, a);
    const ratio = contrastFromLuminances(lum, bgLum);

    if ((ratio >= target) === minAbove) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

/**
 * Convert an array of points to a smooth SVG path using Catmull-Rom → cubic Bezier.
 */
function pointsToSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";

  const first = points[0]!;
  if (points.length === 2) {
    const second = points[1]!;
    return `M${first.x},${first.y}L${second.x},${second.y}`;
  }

  const parts: string[] = [`M${first.x},${first.y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    parts.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }

  return parts.join("");
}
