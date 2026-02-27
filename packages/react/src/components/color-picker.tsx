import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { ColorPickerProps, GradientValue } from "../types";
import { useColorPicker } from "../hooks/use-color-picker";
import { useGradient } from "../hooks/use-gradient";
import { isGradient } from "../utils/css";
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

/**
 * The full context value exposed to all child components.
 * Includes the core color picker state plus gradient editing state.
 *
 * When in gradient mode with an active stop, `hsva` / `setHue` /
 * `setSaturationValue` / `setAlpha` / `setColorFromString` are "routed"
 * to the active stop's color so that Area, HueSlider, AlphaSlider,
 * and Input automatically edit the selected gradient stop.
 */
type ColorPickerContextValue = ReturnType<typeof useColorPicker> & {
  disabled: boolean;
  gradient: ReturnType<typeof useGradient>;
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
 * When the value is a GradientValue, gradient editing state is automatically
 * managed. Selecting a gradient stop routes the Area / HueSlider / AlphaSlider
 * to edit that stop's color.
 *
 * Usage:
 * ```tsx
 * <ColorPicker value={color} onValueChange={setColor}>
 *   <ColorPicker.Trigger />
 *   <ColorPicker.Content>
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
  children,
}: ColorPickerProps) {
  const pickerState = useColorPicker({
    value,
    onValueChange,
    defaultValue,
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

  // --- Stop-color routing ---
  // When in gradient mode with an active stop, we need the HSVA state
  // to reflect the active stop's color, and color mutations to flow
  // back into the gradient stop rather than the top-level value.

  const inGradientEditMode = pickerState.isGradientMode && gradientState.activeStop !== null;

  // Track the active stop color to sync HSVA when the selected stop changes
  const prevActiveStopRef = useRef<string | null>(null);

  useEffect(() => {
    if (inGradientEditMode && gradientState.activeStop) {
      const stopId = gradientState.activeStopId;
      if (stopId !== prevActiveStopRef.current) {
        prevActiveStopRef.current = stopId;
        // Sync HSVA to the active stop's color without propagating
        // to onValueChange (which would overwrite the gradient with a hex string)
        pickerState.syncHSVA(gradientState.activeStop.color);
      }
    }
  }, [inGradientEditMode, gradientState.activeStopId, gradientState.activeStop, pickerState.syncHSVA]);

  // Override color mutation functions to route into the active gradient stop
  const routedSetHue = useCallback(
    (h: number): string => {
      const newColor = pickerState.setHue(h);
      if (inGradientEditMode && gradientState.activeStopId) {
        gradientState.updateStopColor(gradientState.activeStopId, newColor);
      }
      return newColor;
    },
    [pickerState.setHue, inGradientEditMode, gradientState.activeStopId, gradientState.updateStopColor]
  );

  const routedSetSaturationValue = useCallback(
    (s: number, v: number): string => {
      const newColor = pickerState.setSaturationValue(s, v);
      if (inGradientEditMode && gradientState.activeStopId) {
        gradientState.updateStopColor(gradientState.activeStopId, newColor);
      }
      return newColor;
    },
    [pickerState.setSaturationValue, inGradientEditMode, gradientState.activeStopId, gradientState.updateStopColor]
  );

  const routedSetAlpha = useCallback(
    (a: number): string => {
      const newColor = pickerState.setAlpha(a);
      if (inGradientEditMode && gradientState.activeStopId) {
        gradientState.updateStopColor(gradientState.activeStopId, newColor);
      }
      return newColor;
    },
    [pickerState.setAlpha, inGradientEditMode, gradientState.activeStopId, gradientState.updateStopColor]
  );

  const routedSetColorFromString = useCallback(
    (input: string) => {
      pickerState.setColorFromString(input);
      if (inGradientEditMode && gradientState.activeStopId) {
        gradientState.updateStopColor(gradientState.activeStopId, input);
      }
    },
    [pickerState.setColorFromString, inGradientEditMode, gradientState.activeStopId, gradientState.updateStopColor]
  );

  const contextValue: ColorPickerContextValue = useMemo(
    () => ({
      ...pickerState,
      // Override routed functions when in gradient mode
      setHue: routedSetHue,
      setSaturationValue: routedSetSaturationValue,
      setAlpha: routedSetAlpha,
      setColorFromString: routedSetColorFromString,
      disabled,
      gradient: gradientState,
    }),
    [pickerState, routedSetHue, routedSetSaturationValue, routedSetAlpha, routedSetColorFromString, disabled, gradientState]
  );

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
ColorPicker.GradientEditor = ColorPickerGradientEditor;
