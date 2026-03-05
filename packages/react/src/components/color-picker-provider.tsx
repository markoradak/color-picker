import { useCallback, useMemo, useRef } from "react";
import type { ColorPickerProviderProps, ColorPickerValue } from "../types";
import { useColorPicker } from "../hooks/use-color-picker";
import { useGradient } from "../hooks/use-gradient";
import { ColorPickerContext } from "./color-picker-context";

/**
 * Context-only color picker provider (no Popover.Root).
 *
 * Provides an isolated `ColorPickerContext` so that Area, HueSlider,
 * AlphaSlider, and Input can operate on a single solid color.
 * Used inside per-stop popovers to give each stop its own HSVA state.
 */
export function ColorPickerProvider({
  value,
  onValueChange,
  defaultValue = "#000000",
  disabled = false,
  tokens,
  autoTokens,
  children,
}: ColorPickerProviderProps) {
  // Wrap the string-typed callback for the generic useColorPicker hook
  const handleValueChange = useCallback(
    (v: ColorPickerValue) => {
      if (typeof v === "string") {
        onValueChange?.(v);
      }
    },
    [onValueChange]
  );

  const pickerState = useColorPicker({
    value,
    onValueChange: handleValueChange,
    defaultValue,
    tokens,
    autoTokens,
  });

  // No-op gradient state — this provider is solid-color only
  const gradientState = useGradient({});

  // No-op popover state — this provider has no popover
  const noop = useCallback(() => {}, []);
  const preserveFocusRef = useRef(false);
  const emptySwatches: string[] = [];

  const contextValue = useMemo(
    () => ({
      ...pickerState,
      disabled,
      gradient: gradientState,
      popoverOpen: false,
      setPopoverOpen: noop,
      preserveFocusRef,
      swatches: emptySwatches,
      setSwatches: noop as (swatches: string[]) => void,
    }),
    [pickerState, disabled, gradientState, noop]
  );

  return (
    <ColorPickerContext.Provider value={contextValue}>
      {children}
    </ColorPickerContext.Provider>
  );
}
