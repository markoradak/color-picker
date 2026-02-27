// Components
export { ColorPicker, useColorPickerContext } from "./components/color-picker";

// Utilities
export { toCSS, fromCSS, isGradient, isSolidColor } from "./utils/css";
export { parseColor, formatColor, detectFormat, isValidColor, toHSVA, fromHSVA, getContrastColor } from "./utils/color";
export { createGradientStop, sortStops, addStop, removeStop, updateStop, createDefaultGradient } from "./utils/gradient";
export { clamp, getRelativePosition, angleFromPosition } from "./utils/position";

// Hooks
export { usePointerDrag } from "./hooks/use-pointer-drag";
export { useColorPicker } from "./hooks/use-color-picker";
export { useGradient } from "./hooks/use-gradient";

// Types
export type {
  SolidColor,
  ColorFormat,
  GradientStop,
  GradientValue,
  ColorPickerValue,
  ColorPickerProps,
  ColorPickerAreaProps,
  ColorPickerSliderProps,
  ColorPickerInputProps,
  ColorPickerSwatchesProps,
  ColorPickerTriggerProps,
  ColorPickerContentProps,
  HSVA,
} from "./types";
