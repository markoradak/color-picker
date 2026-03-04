import { useCallback, useState, useSyncExternalStore } from "react";
import { useColorPickerContext } from "./color-picker-context";

interface ColorPickerEyeDropperProps {
  className?: string;
}

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
export function ColorPickerEyeDropper({
  className,
}: ColorPickerEyeDropperProps) {
  const { setColorFromString, disabled } = useColorPickerContext();
  const [isPicking, setIsPicking] = useState(false);
  const supported = useEyeDropperSupported();

  const handleClick = useCallback(async () => {
    if (disabled || !supported) return;

    const EyeDropper = (
      window as unknown as { EyeDropper: EyeDropperConstructor }
    ).EyeDropper;

    const dropper = new EyeDropper();
    setIsPicking(true);

    try {
      const result = await dropper.open();
      setColorFromString(result.sRGBHex);
    } catch {
      // User cancelled the picker -- no action needed
    } finally {
      setIsPicking(false);
    }
  }, [setColorFromString, disabled, supported]);

  // Graceful degradation: render nothing if API is unavailable
  if (!supported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPicking}
      aria-label="Pick a color from the screen"
      className={[
        "cp-eye-dropper",
        "inline-flex h-8 w-8 items-center justify-center rounded-md border",
        "outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isPicking ? (
        /* Simple loading indicator */
        <svg
          className="h-4 w-4 animate-spin"
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
      ) : (
        /* Pipette icon */
        <svg
          className="h-4 w-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M13.5 2.5a1.414 1.414 0 0 0-2 0L9.5 4.5l-1-1-5 5V12h3.5l5-5-1-1 2-2a1.414 1.414 0 0 0 0-2Z" />
          <path d="M2 14l2.5-2.5" />
        </svg>
      )}
    </button>
  );
}
