// Components
export { ColorPicker, useColorPickerContext } from "./components/color-picker";
export { ColorPickerProvider } from "./components/color-picker-provider";
export { ColorPickerModeSelector } from "./components/mode-selector";
export { ColorPickerTrigger } from "./components/trigger";
export { ColorPickerContent } from "./components/content";
export { ColorPickerArea } from "./components/area";
export { ColorPickerHueSlider } from "./components/hue-slider";
export { ColorPickerAlphaSlider } from "./components/alpha-slider";
export { ColorPickerInput } from "./components/input";
export { ColorPickerFormatToggle } from "./components/format-toggle";
export { ColorPickerEyeDropper } from "./components/eye-dropper";
export { ColorPickerSwatches } from "./components/swatches";
export { ColorPickerGradientEditor } from "./components/gradient-editor";
export { ColorPickerGradientSwatches } from "./components/gradient-swatches";
export { GradientPreview } from "./components/gradient-preview";
export { GradientStops } from "./components/gradient-stops";

// Pre-composed presets
export { ColorPickerPopover, ColorPickerInline } from "./components/presets";

// Utilities
export { toCSS, fromCSS, isGradient, isSolidColor } from "./utils/css";
export { parseColor, formatColor, detectFormat, isValidColor, toHSVA, fromHSVA, getContrastColor } from "./utils/color";
export { createGradientStop, sortStops, addStop, addStopWithCoordinates, removeStop, updateStop, moveStop, createDefaultGradient, createDefaultGradientFromColor, interpolateColorAt } from "./utils/gradient";
export { clamp, getRelativePosition, angleFromPosition } from "./utils/position";

// Hooks
export { usePointerDrag } from "./hooks/use-pointer-drag";
export { useColorPicker } from "./hooks/use-color-picker";
export { useGradient } from "./hooks/use-gradient";

// Types
export type {
  SolidColor,
  ColorFormat,
  ColorPickerMode,
  GradientStop,
  GradientValue,
  ColorPickerValue,
  ColorPickerProps,
  ColorPickerProviderProps,
  ColorPickerModeSelectorProps,
  ColorPickerAreaProps,
  ColorPickerSliderProps,
  ColorPickerInputProps,
  ColorPickerSwatchesProps,
  ColorPickerGradientSwatchesProps,
  ColorPickerTriggerProps,
  ColorPickerContentProps,
  ColorPickerPresetProps,
  ColorPickerPopoverProps,
  ColorPickerInlineProps,
  HSVA,
} from "./types";
