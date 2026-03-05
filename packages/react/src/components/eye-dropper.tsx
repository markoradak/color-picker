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
          className="h-3.5 w-3.5 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" />
          <path d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z" />
          <path d="m2 22 .414-.414" />
        </svg>
      )}
    </button>
  );
}
