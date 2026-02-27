/**
 * Shared style constants used across multiple color picker components.
 */

/**
 * CSS for a checkerboard pattern background, used to indicate transparency.
 * Apply as `backgroundImage` and `backgroundSize` on a covering element.
 */
export const CHECKERBOARD_STYLE = {
  backgroundImage:
    "repeating-conic-gradient(#e5e5e5 0% 25%, transparent 0% 50%)",
  backgroundSize: "8px 8px",
} as const;
