/**
 * A solid color string in HEX, RGB, or HSL format.
 * Examples: "#ff0000", "rgb(255, 0, 0)", "hsl(0, 100%, 50%)"
 */
export type SolidColor = string;

/**
 * A map of semantic token names to color values.
 * Example: { primary: "#3b82f6", brand: "#f97316" }
 */
export type ColorTokens = Record<string, string>;

/**
 * Configuration for auto-detecting CSS custom property color tokens.
 * - `true` (default): auto-detect all CSS color variables
 * - `false`: disable auto-detection
 * - `{ prefix: string }`: only detect variables matching the prefix, strip it for display names
 */
export type AutoTokensConfig = { prefix?: string } | boolean;

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
  /** Solid color behind all radial blobs (mesh gradients only). */
  baseColor?: string;
  /** Explicit gradient line start point in preview coordinates (0-100). Used by linear, radial, and conic. */
  startPoint?: { x: number; y: number };
  /** Explicit gradient line end point in preview coordinates (0-100). Used by linear, radial, and conic. */
  endPoint?: { x: number; y: number };
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
  /** Whether the popover starts open (uncontrolled) */
  defaultOpen?: boolean;
  /** Map of semantic token names to color values. Token names can be used as `value`. */
  tokens?: ColorTokens;
  /** Auto-detect CSS custom property color tokens. Default: true (detect all). Set to false to disable, or { prefix: "--brand-" } to filter. */
  autoTokens?: AutoTokensConfig;
  /** Children (compound components) */
  children: React.ReactNode;
}

/**
 * Props for the ColorPicker.Area component.
 */
export interface ColorPickerAreaProps {
  className?: string;
  /** Class names for inner elements (overlays, thumb). */
  classNames?: {
    whiteOverlay?: string;
    blackOverlay?: string;
    thumb?: string;
  };
}

/**
 * Props for slider components (Hue, Alpha).
 */
export interface ColorPickerSliderProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  /** Class names for inner elements (track, thumb, checkerboard). */
  classNames?: {
    track?: string;
    thumb?: string;
    /** Alpha slider only: checkerboard pattern background. */
    checkerboard?: string;
  };
}

/**
 * Props for the ColorPicker.Input component.
 */
export interface ColorPickerInputProps {
  className?: string;
  enableFormatToggle?: boolean;
  /** Class names for inner elements. */
  classNames?: {
    formatToggle?: string;
    field?: string;
    tokenBadge?: string;
    tokenIcon?: string;
    tokenListContainer?: string;
    tokenList?: string;
    tokenListItem?: string;
    tokenListSwatch?: string;
    tokenListName?: string;
    tokenListCheck?: string;
  };
}

/**
 * Props for the ColorPicker.Swatches component.
 */
export interface ColorPickerSwatchesProps {
  values?: string[];
  columns?: number;
  className?: string;
  /** Class names for inner elements. */
  classNames?: {
    swatch?: string;
  };
}

/**
 * Props for the ColorPicker.GradientSwatches component.
 */
export interface ColorPickerGradientSwatchesProps {
  values?: GradientValue[];
  columns?: number;
  className?: string;
  /** Class names for inner elements. */
  classNames?: {
    swatch?: string;
  };
}

/**
 * Props for the ColorPicker.Trigger component.
 */
export interface ColorPickerTriggerProps {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
  /** Class names for inner elements. */
  classNames?: {
    checkerboard?: string;
    swatch?: string;
  };
}

/**
 * Props for the ColorPickerInputTrigger component.
 * An input-style trigger where the thumbnail opens the popover,
 * while the text input, format toggle, and eye dropper are interactive inline.
 */
export interface ColorPickerInputTriggerProps {
  className?: string;
  /** Show the format toggle button inline. Default: true */
  enableFormatToggle?: boolean;
  /** Show the eye dropper button inline (auto-hidden if browser unsupported). Default: true */
  enableEyeDropper?: boolean;
  /** Class names for inner elements. */
  classNames?: {
    thumbnail?: string;
    thumbnailCheckerboard?: string;
    thumbnailSwatch?: string;
    formatToggle?: string;
    formatLabel?: string;
    input?: string;
    eyeDropper?: string;
    eyeDropperIcon?: string;
    eyeDropperSpinner?: string;
    tokenBadge?: string;
    tokenIcon?: string;
    gradientDisplay?: string;
    tokenListContainer?: string;
    tokenList?: string;
    tokenListItem?: string;
    tokenListSwatch?: string;
    tokenListName?: string;
    tokenListCheck?: string;
  };
}

/**
 * Props for the ColorPicker.Content component.
 */
export interface ColorPickerContentProps {
  className?: string;
  style?: React.CSSProperties;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /** Called when the popover content receives focus after opening. Call `event.preventDefault()` to prevent auto-focus. */
  onOpenAutoFocus?: (event: Event) => void;
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
  /** Show the solid/gradient mode selector. Default: true when enableGradient is true */
  enableModeSelector?: boolean;
  /** Show the EyeDropper button (auto-hidden if browser unsupported). Default: true */
  enableEyeDropper?: boolean;
  /** Show the color format toggle button. Default: true */
  enableFormatToggle?: boolean;
  /** Map of semantic token names to color values. Token names can be used as `value`. */
  tokens?: ColorTokens;
  /** Auto-detect CSS custom property color tokens. Default: true (detect all). Set to false to disable, or { prefix: "--brand-" } to filter. */
  autoTokens?: AutoTokensConfig;
  /** Preset swatch colors to display (solid mode) */
  swatches?: string[];
  /** Number of columns for the swatch grid. Default: 8 */
  swatchColumns?: number;
  /** Preset gradient swatches to display (gradient mode) */
  gradientSwatches?: GradientValue[];
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
  /**
   * Trigger display mode.
   * - "thumbnail": Renders a small color swatch button (default).
   * - "input": Renders an input-style trigger showing the color thumbnail and formatted value.
   *
   * Ignored when a custom `trigger` is provided.
   * Default: "thumbnail"
   */
  triggerMode?: "thumbnail" | "input";
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
  /** Class names for inner elements. */
  classNames?: {
    button?: string;
  };
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
  /** Map of semantic token names to color values. Token names can be used as `value`. */
  tokens?: ColorTokens;
  /** Auto-detect CSS custom property color tokens. Default: true (detect all). Set to false to disable, or { prefix: "--brand-" } to filter. */
  autoTokens?: AutoTokensConfig;
  /** Children (compound components) */
  children: React.ReactNode;
}
