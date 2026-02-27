import { useCallback, useState } from "react";
import { useColorPickerContext } from "./color-picker";

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

/**
 * Check if the EyeDropper API is available in the current browser.
 */
function isEyeDropperSupported(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
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

  const handleClick = useCallback(async () => {
    if (disabled || !isEyeDropperSupported()) return;

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
  }, [setColorFromString, disabled]);

  // Graceful degradation: render nothing if API is unavailable
  if (!isEyeDropperSupported()) {
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
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700",
        "outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
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
