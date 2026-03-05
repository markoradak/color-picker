import { useCallback, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerProps, GradientValue } from "../types";
import { useColorPicker } from "../hooks/use-color-picker";
import { useGradient } from "../hooks/use-gradient";
import { isGradient } from "../utils/css";
import { ColorPickerContext } from "./color-picker-context";
import { ColorPickerTrigger } from "./trigger";
import { ColorPickerContent } from "./content";
import { ColorPickerArea } from "./area";
import { ColorPickerHueSlider } from "./hue-slider";
import { ColorPickerAlphaSlider } from "./alpha-slider";
import { ColorPickerInput } from "./input";
import { ColorPickerFormatToggle } from "./format-toggle";
import { ColorPickerEyeDropper } from "./eye-dropper";
import { ColorPickerSwatches } from "./swatches";
import { ColorPickerGradientEditor } from "./gradient-editor";
import { ColorPickerModeSelector } from "./mode-selector";
import { ColorPickerProvider } from "./color-picker-provider";
import { ColorPickerGradientSwatches } from "./gradient-swatches";

// Re-export for backward compatibility
export { useColorPickerContext } from "./color-picker-context";

/**
 * Root compound component for the color picker.
 * Wraps children in a Radix Popover.Root and provides color picker context.
 *
 * When the value is a GradientValue, gradient editing state is automatically
 * managed. Individual gradient stop colors are edited via per-stop popovers
 * in the GradientStops component.
 *
 * Usage:
 * ```tsx
 * <ColorPicker value={color} onValueChange={setColor}>
 *   <ColorPicker.Trigger />
 *   <ColorPicker.Content>
 *     <ColorPicker.ModeSelector />
 *     <ColorPicker.Area />
 *     <ColorPicker.HueSlider />
 *     <ColorPicker.AlphaSlider />
 *     <ColorPicker.GradientEditor />
 *   </ColorPicker.Content>
 * </ColorPicker>
 * ```
 */
export function ColorPicker({
  value,
  onValueChange,
  defaultValue,
  disabled = false,
  defaultOpen = false,
  tokens,
  autoTokens,
  children,
}: ColorPickerProps) {
  const pickerState = useColorPicker({
    value,
    onValueChange,
    defaultValue,
    tokens,
    autoTokens,
  });

  // Gradient state -- wired to the gradient portion of the value
  const gradientValue = isGradient(pickerState.value)
    ? (pickerState.value as GradientValue)
    : undefined;

  const handleGradientChange = useCallback(
    (newGradient: GradientValue) => {
      pickerState.updateValue(newGradient);
    },
    [pickerState.updateValue]
  );

  const gradientState = useGradient({
    value: gradientValue,
    onValueChange: handleGradientChange,
  });

  const [popoverOpen, setPopoverOpen] = useState(defaultOpen);
  const preserveFocusRef = useRef(false);
  const [registeredSwatches, setRegisteredSwatches] = useState<string[]>([]);

  const contextValue = useMemo(
    () => ({
      ...pickerState,
      disabled,
      gradient: gradientState,
      popoverOpen,
      setPopoverOpen,
      preserveFocusRef,
      swatches: registeredSwatches,
      setSwatches: setRegisteredSwatches,
    }),
    [pickerState, disabled, gradientState, popoverOpen, registeredSwatches]
  );

  return (
    <ColorPickerContext.Provider value={contextValue}>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        {children}
      </Popover.Root>
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
ColorPicker.GradientEditor = ColorPickerGradientEditor;
ColorPicker.ModeSelector = ColorPickerModeSelector;
ColorPicker.GradientSwatches = ColorPickerGradientSwatches;
ColorPicker.Provider = ColorPickerProvider;
