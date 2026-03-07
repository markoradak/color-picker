import { forwardRef, useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { ColorPickerEyeDropperProps } from "../types";
import { useColorPickerContext } from "./color-picker-context";

// Type for the EyeDropper API (not yet in all TypeScript lib definitions)
interface EyeDropperAPI {
  open: () => Promise<{ sRGBHex: string }>;
}

interface EyeDropperConstructor {
  new (): EyeDropperAPI;
}

const emptySubscribe = () => () => {};

function getEyeDropperSupported() {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

function getServerSnapshot() {
  return false;
}

/**
 * SSR-safe hook that returns whether the EyeDropper API is available.
 * Returns false on the server and during hydration, then the real value
 * after mount — avoiding hydration mismatches.
 */
function useEyeDropperSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    getEyeDropperSupported,
    getServerSnapshot,
  );
}

/**
 * Button that activates the browser's EyeDropper API to sample a color
 * from anywhere on screen. Returns null if the API is not supported
 * (e.g., Firefox, Safari).
 *
 * Shows a pipette icon and a loading state while the picker is active.
 */
export const ColorPickerEyeDropper = forwardRef<
  HTMLButtonElement,
  ColorPickerEyeDropperProps
>(function ColorPickerEyeDropper({ className, classNames }, ref) {
  const { setColorFromString, disabled } = useColorPickerContext();
  const [isPicking, setIsPicking] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const supported = useEyeDropperSupported();

  const handleClick = useCallback(async () => {
    if (disabled || !supported) return;

    const EyeDropper = (
      window as unknown as { EyeDropper: EyeDropperConstructor }
    ).EyeDropper;

    const dropper = new EyeDropper();
    setIsPicking(true);
    setShowCheck(false);
    clearTimeout(checkTimerRef.current);

    try {
      const result = await dropper.open();
      setColorFromString(result.sRGBHex);
      setIsPicking(false);
      setShowCheck(true);
      checkTimerRef.current = setTimeout(() => setShowCheck(false), 1200);
    } catch {
      // User cancelled the picker -- no action needed
      setIsPicking(false);
    }
  }, [setColorFromString, disabled, supported]);

  // Graceful degradation: render nothing if API is unavailable
  if (!supported) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={disabled || isPicking}
      aria-label={showCheck ? "Color picked" : isPicking ? "Picking color..." : "Pick a color from the screen"}
      data-cp-part="eye-dropper"
      data-disabled={disabled ? "" : undefined}
      data-picking={isPicking ? "" : undefined}
      className={className}
    >
      <span data-cp-el="icon-wrapper" style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {/* Pipette icon */}
        <svg
          data-cp-el="icon"
          className={classNames?.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transition: "opacity 0.2s ease, transform 0.2s ease",
            opacity: !isPicking && !showCheck ? 1 : 0,
            transform: !isPicking && !showCheck ? "scale(1)" : "scale(0.5)",
          }}
        >
          <path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" />
          <path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" />
          <path d="m2 22 .414-.414" />
        </svg>
        {/* Spinner */}
        <span
          style={{
            position: "absolute",
            display: "inline-flex",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            opacity: isPicking ? 1 : 0,
            transform: isPicking ? "scale(1)" : "scale(0.5)",
          }}
        >
          <svg
            data-cp-el="spinner"
            className={classNames?.spinner}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="28"
              strokeDashoffset="10"
            />
          </svg>
        </span>
        {/* Checkmark */}
        <svg
          data-cp-el="check"
          className={classNames?.check}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            position: "absolute",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            opacity: showCheck ? 1 : 0,
            transform: showCheck ? "scale(1)" : "scale(0.8)",
          }}
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
    </button>
  );
});
