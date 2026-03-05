import { createContext, useContext } from "react";
import type { useColorPicker } from "../hooks/use-color-picker";
import type { useGradient } from "../hooks/use-gradient";

/**
 * The full context value exposed to all child components.
 * Includes the core color picker state plus gradient editing state.
 */
export type ColorPickerContextValue = ReturnType<typeof useColorPicker> & {
  disabled: boolean;
  gradient: ReturnType<typeof useGradient>;
  /** Whether the popover is currently open. */
  popoverOpen: boolean;
  /** Set the popover open state. */
  setPopoverOpen: (open: boolean) => void;
  /** Ref that, when true, tells Content to skip auto-focus on open. */
  preserveFocusRef: React.RefObject<boolean>;
  /** Preset color swatches shared with nested pickers (e.g. gradient stop popovers). */
  swatches: string[];
  /** Register swatches in context (called by ColorPickerSwatches on mount). */
  setSwatches: (swatches: string[]) => void;
};

export const ColorPickerContext =
  createContext<ColorPickerContextValue | null>(null);

/**
 * Hook to access the color picker context.
 * Must be used within a <ColorPicker> or <ColorPickerProvider> component.
 */
export function useColorPickerContext(): ColorPickerContextValue {
  const ctx = useContext(ColorPickerContext);
  if (!ctx) {
    throw new Error(
      "useColorPickerContext must be used within a <ColorPicker> component."
    );
  }
  return ctx;
}
