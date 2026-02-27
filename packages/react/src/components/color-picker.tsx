import { createContext, useContext } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerProps } from "../types";
import { useColorPicker } from "../hooks/use-color-picker";
import { ColorPickerTrigger } from "./trigger";
import { ColorPickerContent } from "./content";
import { ColorPickerArea } from "./area";
import { ColorPickerHueSlider } from "./hue-slider";
import { ColorPickerAlphaSlider } from "./alpha-slider";
import { ColorPickerInput } from "./input";
import { ColorPickerFormatToggle } from "./format-toggle";
import { ColorPickerEyeDropper } from "./eye-dropper";
import { ColorPickerSwatches } from "./swatches";

type ColorPickerContextValue = ReturnType<typeof useColorPicker> & {
  disabled: boolean;
};

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
 * Wraps children in a Radix Popover.Root and provides color picker context.
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
  disabled = false,
  children,
}: ColorPickerProps) {
  const pickerState = useColorPicker({
    value,
    onValueChange,
    defaultValue,
  });

  const contextValue: ColorPickerContextValue = {
    ...pickerState,
    disabled,
  };

  return (
    <ColorPickerContext.Provider value={contextValue}>
      <Popover.Root>{children}</Popover.Root>
    </ColorPickerContext.Provider>
  );
}

// Attach compound sub-components as static properties
ColorPicker.Trigger = ColorPickerTrigger;
ColorPicker.Content = ColorPickerContent;
ColorPicker.Area = ColorPickerArea;
ColorPicker.HueSlider = ColorPickerHueSlider;
ColorPicker.AlphaSlider = ColorPickerAlphaSlider;
ColorPicker.Input = ColorPickerInput;
ColorPicker.FormatToggle = ColorPickerFormatToggle;
ColorPicker.EyeDropper = ColorPickerEyeDropper;
ColorPicker.Swatches = ColorPickerSwatches;
