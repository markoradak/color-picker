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
 * The type of gradient (linear, radial, conic, or mesh).
 * Shared between `GradientValue.type` and `ColorPickerMode`.
 */
export type GradientType = "linear" | "radial" | "conic" | "mesh";

/**
 * The active mode of the color picker.
 * "solid" for a flat color string, or a gradient type.
 */
export type ColorPickerMode = "solid" | GradientType;

/**
 * Supported color format identifiers.
 */
export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

/**
 * A single gradient stop with a color and position along the gradient axis.
 * Used by linear, radial, and conic gradient types.
 */
export interface GradientStop {
  id: string;
  color: SolidColor;
  position: number; // 0-100
}

/**
 * A gradient stop for mesh gradients, which requires explicit 2D coordinates.
 */
export interface MeshGradientStop {
  id: string;
  color: SolidColor;
  position: number; // 0-100
  x: number; // 0-100
  y: number; // 0-100
}

/**
 * Shared fields for all gradient types.
 */
interface BaseGradientFields {
  /** @internal UI state for gradient line drag handles. Not part of the serialized value -- consumers should strip these before persisting. */
  startPoint?: { x: number; y: number };
  /** @internal UI state for gradient line drag handles. Not part of the serialized value -- consumers should strip these before persisting. */
  endPoint?: { x: number; y: number };
}

/**
 * A linear gradient with an angle in degrees.
 */
export interface LinearGradientValue extends BaseGradientFields {
  type: "linear";
  stops: GradientStop[];
  angle: number;
}

/**
 * A radial gradient with a center position.
 */
export interface RadialGradientValue extends BaseGradientFields {
  type: "radial";
  stops: GradientStop[];
  centerX: number;
  centerY: number;
}

/**
 * A conic gradient with an angle and center position.
 */
export interface ConicGradientValue extends BaseGradientFields {
  type: "conic";
  stops: GradientStop[];
  angle: number;
  centerX: number;
  centerY: number;
}

/**
 * A mesh gradient simulated as layered radial gradients.
 * Each stop has explicit 2D coordinates for blob placement.
 */
export interface MeshGradientValue extends BaseGradientFields {
  type: "mesh";
  stops: MeshGradientStop[];
  /** Solid color behind all radial blobs. */
  baseColor?: SolidColor;
}

/**
 * Discriminated union of all gradient types.
 * Use `value.type` to narrow to a specific gradient variant.
 */
export type GradientValue =
  | LinearGradientValue
  | RadialGradientValue
  | ConicGradientValue
  | MeshGradientValue;

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
export interface ColorPickerAreaProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  children?: React.ReactNode;
}

/**
 * Props for the ColorPickerAreaGradient sub-component.
 * Renders the white-to-transparent and transparent-to-black overlays.
 */
export interface ColorPickerAreaGradientProps {
  className?: string;
}

/**
 * Props for the ColorPickerAreaThumb sub-component.
 * Renders the draggable indicator dot positioned by saturation/value.
 */
export interface ColorPickerAreaThumbProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
}

/**
 * Props for slider components (Hue, Alpha).
 */
export interface ColorPickerSliderProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  children?: React.ReactNode;
}

/**
 * Props for the ColorPickerHueSliderTrack sub-component.
 * Renders the rainbow gradient track.
 */
export interface ColorPickerHueSliderTrackProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
}

/**
 * Props for the ColorPickerHueSliderThumb sub-component.
 * Renders the draggable thumb indicator positioned by hue.
 */
export interface ColorPickerHueSliderThumbProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
}

/**
 * Props for the ColorPickerAlphaSliderTrack sub-component.
 * Renders the checkerboard + alpha gradient track.
 */
export interface ColorPickerAlphaSliderTrackProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
}

/**
 * Props for the ColorPickerAlphaSliderThumb sub-component.
 * Renders the draggable thumb indicator positioned by alpha.
 */
export interface ColorPickerAlphaSliderThumbProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
}

/**
 * Shared class name overrides for the token list dropdown.
 * Used by both ColorPickerInput and ColorPickerInputTrigger.
 */
export interface TokenListClassNames {
  tokenBadge?: string;
  tokenIcon?: string;
  tokenSearch?: string;
  tokenSearchInput?: string;
  tokenSearchIcon?: string;
  tokenListContainer?: string;
  tokenList?: string;
  tokenListItem?: string;
  tokenListSwatch?: string;
  tokenListName?: string;
  tokenListCheck?: string;
  tokenListEmpty?: string;
}

/**
 * Props for the ColorPicker.Input component.
 */
export interface ColorPickerInputProps {
  className?: string;
  enableFormatToggle?: boolean;
  /** Enable search filtering in the token dropdown. Default: true */
  enableTokenSearch?: boolean;
  /** Class names for inner elements. */
  classNames?: {
    formatToggle?: string;
    field?: string;
  } & TokenListClassNames;
}

/**
 * Props for the ColorPicker.Swatches component.
 */
export interface ColorPickerSwatchesProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  values?: string[];
  columns?: number;
  swatchClassName?: string;
  children?: React.ReactNode;
}

/**
 * Props for the ColorPickerSwatch sub-component.
 * Renders an individual color swatch button.
 */
export interface ColorPickerSwatchProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value" | "children"> {
  value: string;
}

/**
 * Props for the ColorPicker.GradientSwatches component.
 */
export interface ColorPickerGradientSwatchesProps {
  values?: GradientValue[];
  columns?: number;
  className?: string;
  swatchClassName?: string;
  children?: React.ReactNode;
}

/**
 * Props for the ColorPickerGradientSwatch sub-component.
 * Renders an individual gradient swatch button.
 */
export interface ColorPickerGradientSwatchProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value" | "children"> {
  value: GradientValue;
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
export interface ColorPickerInputTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  /** Show the format toggle button inline. Default: true */
  enableFormatToggle?: boolean;
  /** Show the eye dropper button inline (auto-hidden if browser unsupported). Default: true */
  enableEyeDropper?: boolean;
  /** Enable search filtering in the token dropdown. Default: true */
  enableTokenSearch?: boolean;
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
    eyeDropperCheck?: string;
    gradientDisplay?: string;
  } & TokenListClassNames;
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
  /** Show the gradient editor controls (only when value is a GradientValue). Default: true */
  enableGradient?: boolean;
  /** Show the solid/gradient mode selector. Default: true when enableGradient is true */
  enableModeSelector?: boolean;
  /** Show the EyeDropper button (auto-hidden if browser unsupported). Default: true */
  enableEyeDropper?: boolean;
  /** Show the color format toggle button. Default: true */
  enableFormatToggle?: boolean;
  /** Show the type-to-filter search in the token dropdown. Default: true */
  enableTokenSearch?: boolean;
  /** Map of semantic token names to color values. Token names can be used as `value`. */
  tokens?: ColorTokens;
  /** Auto-detect CSS custom property color tokens. Default: true (detect all). Set to false to disable, or { prefix: "--brand-" } to filter. */
  autoTokens?: AutoTokensConfig;
  /** Show preset swatches. Default: true */
  enableSwatches?: boolean;
  /** Preset swatch colors to display (solid mode). Defaults to a built-in palette when omitted. */
  swatches?: string[];
  /** Number of columns for the swatch grid. Default: 8 */
  swatchColumns?: number;
  /** Preset gradient swatches to display (gradient mode) */
  gradientSwatches?: GradientValue[];
  /** Reference color for the WCAG contrast info row (solid mode only). When provided, the contrast row and threshold line are rendered. */
  contrastColor?: string;
  /** Callback when the user changes the contrast color via the indicator popover. */
  onContrastColorChange?: (color: string) => void;
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
export interface ColorPickerModeSelectorProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  children?: React.ReactNode;
}

/**
 * Props for the ColorPickerModeSelectorItem sub-component.
 * Renders an individual mode button.
 */
export interface ColorPickerModeSelectorItemProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value" | "children"> {
  value: ColorPickerMode;
}

/**
 * Props for the ColorPickerFormatToggle component.
 * Button that cycles through color formats (HEX, RGB, HSL, OKLCH).
 */
export interface ColorPickerFormatToggleProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
}

/**
 * Props for the ColorPickerContrastInfo component.
 * Displays the WCAG contrast ratio between the current color and a reference color.
 */
export interface ColorPickerContrastInfoProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** The background/reference color to compare against. */
  contrastColor: string;
  /** Callback when the user changes the contrast color via the indicator. */
  onContrastColorChange?: (color: string) => void;
  /** Class names for inner elements. */
  classNames?: {
    indicator?: string;
    ratio?: string;
    badge?: string;
  };
}

/**
 * Props for the ColorPickerEyeDropper component.
 * Button that activates the browser's EyeDropper API to sample a color from the screen.
 */
export interface ColorPickerEyeDropperProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Class names for inner elements. */
  classNames?: {
    icon?: string;
    spinner?: string;
    check?: string;
  };
}

/**
 * Props for the ColorPickerGradientEditor component.
 * Self-contained gradient editing UI with preview and stop manipulation.
 */
export interface ColorPickerGradientEditorProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  /** Class names for inner elements. */
  classNames?: {
    preview?: string;
    stopDot?: string;
    baseColor?: string;
    contextMenu?: string;
    contextMenuItem?: string;
    popoverContent?: string;
  };
}

/**
 * Props for the GradientPreview component.
 * All-in-one gradient editor preview with stop dots and manipulation.
 */
export interface GradientPreviewProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  /** Class names for inner elements. */
  classNames?: {
    stopDot?: string;
    baseColor?: string;
    contextMenu?: string;
    contextMenuItem?: string;
    popoverContent?: string;
  };
}

/**
 * Props for the GradientStops component.
 * Horizontal gradient stop bar with draggable stop markers.
 */
export interface GradientStopsProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "defaultValue"> {
  /** Class names for inner elements. */
  classNames?: {
    bar?: string;
    stopMarker?: string;
    popoverContent?: string;
  };
}

/**
 * Props for the ColorPickerControls component.
 * Shared inner controls rendered by both popover and inline presets.
 */
export interface ColorPickerControlsProps {
  /** Show alpha/opacity slider. Default: true */
  enableAlpha?: boolean;
  /** Show the gradient editor controls (only when value is a GradientValue). Default: true */
  enableGradient?: boolean;
  /** Show the solid/gradient mode selector. Default: true when enableGradient is true */
  enableModeSelector?: boolean;
  /** Show the EyeDropper button (auto-hidden if browser unsupported). Default: true */
  enableEyeDropper?: boolean;
  /** Show the color format toggle button. Default: true */
  enableFormatToggle?: boolean;
  /** Show the type-to-filter search in the token dropdown. Default: true */
  enableTokenSearch?: boolean;
  /** Show preset swatches. Default: true */
  enableSwatches?: boolean;
  /** Preset swatch colors to display (solid mode). Defaults to a built-in palette when omitted. */
  swatches?: string[];
  /** Number of columns for the swatch grid. Default: 8 */
  swatchColumns?: number;
  /** Preset gradient swatches to display (gradient mode) */
  gradientSwatches?: GradientValue[];
  /** Reference color for the WCAG contrast info row (solid mode only). When provided, the contrast row and threshold line are rendered. */
  contrastColor?: string;
  /** Callback when the user changes the contrast color via the indicator popover. */
  onContrastColorChange?: (color: string) => void;
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
