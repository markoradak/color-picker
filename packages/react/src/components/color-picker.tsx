import { createContext, useContext } from "react";
import type { ColorPickerProps } from "../types";
import { useColorPicker } from "../hooks/use-color-picker";

type ColorPickerContextValue = ReturnType<typeof useColorPicker>;

const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);

/**
 * Hook to access the color picker context.
 * Must be used within a <ColorPicker> component.
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

/**
 * Root compound component for the color picker.
 *
 * Usage:
 * ```tsx
 * <ColorPicker value={color} onValueChange={setColor}>
 *   <ColorPicker.Trigger />
 *   <ColorPicker.Content>
 *     <ColorPicker.Area />
 *     <ColorPicker.HueSlider />
 *   </ColorPicker.Content>
 * </ColorPicker>
 * ```
 */
export function ColorPicker({
  value,
  onValueChange,
  defaultValue,
  disabled: _disabled,
  children,
}: ColorPickerProps) {
  const pickerState = useColorPicker({
    value,
    onValueChange,
    defaultValue,
  });

  return (
    <ColorPickerContext.Provider value={pickerState}>
      {children}
    </ColorPickerContext.Provider>
  );
}
