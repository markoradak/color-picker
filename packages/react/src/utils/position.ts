/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get the normalized (0-1) position of a pointer event relative to an element.
 */
export function getRelativePosition(
  event: { clientX: number; clientY: number },
  element: HTMLElement
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
  };
}

/**
 * Calculate the angle (in degrees) from a center point to a position.
 */
export function angleFromPosition(
  x: number,
  y: number,
  centerX: number,
  centerY: number
): number {
  const radians = Math.atan2(y - centerY, x - centerX);
  const degrees = (radians * 180) / Math.PI + 90;
  return ((degrees % 360) + 360) % 360;
}
