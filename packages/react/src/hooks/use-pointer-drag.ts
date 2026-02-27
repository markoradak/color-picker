import { useCallback, useRef, useState } from "react";
import { getRelativePosition } from "../utils/position";

interface UsePointerDragOptions {
  onDragStart?: (position: { x: number; y: number }) => void;
  onDrag: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

interface UsePointerDragReturn {
  isDragging: boolean;
  handlePointerDown: (event: React.PointerEvent<HTMLElement>) => void;
}

/**
 * Hook for tracking pointer drag interactions on an element.
 * Returns normalized (0-1) positions relative to the target element.
 */
export function usePointerDrag(
  options: UsePointerDragOptions
): UsePointerDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return; // Only primary button

      const element = event.currentTarget;
      elementRef.current = element;
      element.setPointerCapture(event.pointerId);

      const position = getRelativePosition(event, element);
      setIsDragging(true);
      optionsRef.current.onDragStart?.(position);
      optionsRef.current.onDrag(position);

      const handlePointerMove = (e: PointerEvent) => {
        if (!elementRef.current) return;
        const pos = getRelativePosition(e, elementRef.current);
        optionsRef.current.onDrag(pos);
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (elementRef.current) {
          const pos = getRelativePosition(e, elementRef.current);
          optionsRef.current.onDragEnd?.(pos);
          elementRef.current.releasePointerCapture(e.pointerId);
        }
        setIsDragging(false);
        elementRef.current = null;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    []
  );

  return { isDragging, handlePointerDown };
}
