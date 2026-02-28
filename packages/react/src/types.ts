/**
 * A solid color string in HEX, RGB, or HSL format.
 * Examples: "#ff0000", "rgb(255, 0, 0)", "hsl(0, 100%, 50%)"
 */
export type SolidColor = string;

/**
 * The active mode of the color picker.
 * "solid" for a flat color string, or a gradient type.
 */
export type ColorPickerMode = "solid" | "linear" | "radial" | "conic" | "mesh";

/**
 * Supported color format identifiers.
 */
export type ColorFormat = "hex" | "rgb" | "hsl";

/**
 * A single gradient stop with position and optional 2D coordinates (for mesh gradients).
 */
export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0-100
  x?: number; // mesh only, 0-100
  y?: number; // mesh only, 0-100
}

/**
 * Structured representation of a CSS gradient.
 */
export interface GradientValue {
  type: "linear" | "radial" | "conic" | "mesh";
  stops: GradientStop[];
  angle?: number; // degrees, for linear and conic
  centerX?: number; // 0-100, for radial and conic
  centerY?: number; // 0-100, for radial and conic
}

/**
 * The unified value type for the color picker.
 * Either a solid color string or a structured gradient object.
 */
export type ColorPickerValue = SolidColor | GradientValue;

/**
 * Props for the root ColorPicker component.
 */
export interface ColorPickerProps {
  /** Controlled value */
  value?: ColorPickerValue;
  /** Callback fired when the value changes */
  onValueChange?: (value: ColorPickerValue) => void;
  /** Default value for uncontrolled mode */
  defaultValue?: ColorPickerValue;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Children (compound components) */
  children: React.ReactNode;
}

/**
 * Props for the ColorPicker.Area component.
 */
export interface ColorPickerAreaProps {
  className?: string;
}

/**
 * Props for slider components (Hue, Alpha).
 */
export interface ColorPickerSliderProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

/**
 * Props for the ColorPicker.Input component.
 */
export interface ColorPickerInputProps {
  className?: string;
}

/**
 * Props for the ColorPicker.Swatches component.
 */
export interface ColorPickerSwatchesProps {
  colors: string[];
  columns?: number;
  className?: string;
}

/**
 * Props for the ColorPicker.Trigger component.
 */
export interface ColorPickerTriggerProps {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}

/**
 * Props for the ColorPicker.Content component.
 */
export interface ColorPickerContentProps {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  children: React.ReactNode;
}

/**
 * HSVA color representation for internal state management.
 * Using HSV avoids rounding issues during drag interactions.
 */
export interface HSVA {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}

/**
 * Shared configuration for pre-composed color picker presets.
 */
export interface ColorPickerPresetProps {
  /** Controlled color value */
  value?: ColorPickerValue;
  /** Callback fired when the value changes */
  onValueChange?: (value: ColorPickerValue) => void;
  /** Default value for uncontrolled mode */
  defaultValue?: ColorPickerValue;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Show alpha/opacity slider. Default: true */
  enableAlpha?: boolean;
  /** Show the gradient editor controls (only when value is a GradientValue). Default: false */
  enableGradient?: boolean;
  /** Show the EyeDropper button (auto-hidden if browser unsupported). Default: true */
  enableEyeDropper?: boolean;
  /** Show the color format toggle button. Default: true */
  enableFormatToggle?: boolean;
  /** Preset swatch colors to display */
  swatches?: string[];
  /** Number of columns for the swatch grid. Default: 8 */
  swatchColumns?: number;
  /** Additional CSS class for the outer wrapper */
  className?: string;
}

/**
 * Props for the ColorPickerPopover preset.
 * Includes all shared preset props plus popover-specific positioning.
 */
export interface ColorPickerPopoverProps extends ColorPickerPresetProps {
  /** Popover placement side. Default: "bottom" */
  side?: "top" | "right" | "bottom" | "left";
  /** Popover alignment. Default: "center" */
  align?: "start" | "center" | "end";
  /** Offset from the trigger in pixels. Default: 4 */
  sideOffset?: number;
  /** Custom trigger element. If not provided, a default color swatch trigger is rendered. */
  trigger?: React.ReactNode;
}

/**
 * Props for the ColorPickerInline preset.
 * Uses all shared preset props (no popover-specific options).
 */
export type ColorPickerInlineProps = ColorPickerPresetProps;

/**
 * Props for the ColorPickerModeSelector component.
 */
export interface ColorPickerModeSelectorProps {
  className?: string;
}

/**
 * Props for the ColorPickerProvider component.
 * A context-only wrapper (no Popover.Root) for embedding picker controls
 * inside per-stop popovers or other isolated contexts.
 */
export interface ColorPickerProviderProps {
  /** Controlled solid color value */
  value?: string;
  /** Callback fired when the color changes */
  onValueChange?: (value: string) => void;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Children (compound components) */
  children: React.ReactNode;
}
