# @markoradak/color-picker

A compound-component React color picker and gradient editor. Built with Radix primitives, fully accessible, and themeable via CSS custom properties or Tailwind CSS.

## Installation

```bash
pnpm add @markoradak/color-picker
# or
npm install @markoradak/color-picker
# or
yarn add @markoradak/color-picker
```

**Peer dependencies**: `react >= 18.0.0` and `react-dom >= 18.0.0`

## Quick Start

### Pre-composed Popover (easiest)

A ready-to-use popover picker with all controls included:

```tsx
import { useState } from "react";
import { ColorPickerPopover } from "@markoradak/color-picker/presets";
import "@markoradak/color-picker/styles";

function App() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPickerPopover
      value={color}
      onValueChange={setColor}
      swatches={["#ef4444", "#22c55e", "#3b82f6"]}
    />
  );
}
```

### Pre-composed Inline

An always-visible picker (no popover):

```tsx
import { useState } from "react";
import { ColorPickerInline } from "@markoradak/color-picker/presets";
import "@markoradak/color-picker/styles";

function App() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPickerInline value={color} onValueChange={setColor} />
  );
}
```

### Compound Components (full control)

Build your own layout by composing individual primitives. Both dot notation (`ColorPicker.Area`) and named imports (`ColorPickerArea`) work:

```tsx
import { useState } from "react";
import { ColorPicker } from "@markoradak/color-picker";
import "@markoradak/color-picker/styles";

function MyColorPicker() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <ColorPicker.Trigger />
      <ColorPicker.Content>
        <ColorPicker.Area>
          <ColorPicker.AreaGradient />
          <ColorPicker.AreaThumb />
        </ColorPicker.Area>
        <ColorPicker.HueSlider>
          <ColorPicker.HueSliderTrack />
          <ColorPicker.HueSliderThumb />
        </ColorPicker.HueSlider>
        <ColorPicker.AlphaSlider>
          <ColorPicker.AlphaSliderTrack />
          <ColorPicker.AlphaSliderThumb />
        </ColorPicker.AlphaSlider>
        <ColorPicker.Input />
        <ColorPicker.EyeDropper />
        <ColorPicker.Swatches
          values={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"]}
        />
      </ColorPicker.Content>
    </ColorPicker>
  );
}
```

Or using named imports:

```tsx
import {
  ColorPicker,
  ColorPickerTrigger,
  ColorPickerContent,
  ColorPickerArea,
  ColorPickerAreaGradient,
  ColorPickerAreaThumb,
  ColorPickerHueSlider,
  ColorPickerHueSliderTrack,
  ColorPickerHueSliderThumb,
  ColorPickerInput,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerSwatch,
} from "@markoradak/color-picker";
```

### Gradient Picker

Pass a `GradientValue` object instead of a string to enable gradient editing:

```tsx
import { useState } from "react";
import { ColorPicker, createDefaultGradient } from "@markoradak/color-picker";
import type { ColorPickerValue } from "@markoradak/color-picker";
import "@markoradak/color-picker/styles";

function GradientPicker() {
  const [value, setValue] = useState<ColorPickerValue>(
    createDefaultGradient("linear")
  );

  return (
    <ColorPicker value={value} onValueChange={setValue}>
      <ColorPicker.Trigger />
      <ColorPicker.Content>
        <ColorPicker.ModeSelector>
          {(["solid", "linear", "radial", "conic", "mesh"] as const).map(
            (mode) => (
              <ColorPicker.ModeSelectorItem key={mode} value={mode} />
            )
          )}
        </ColorPicker.ModeSelector>
        <ColorPicker.GradientEditor />
        <ColorPicker.Area>
          <ColorPicker.AreaGradient />
          <ColorPicker.AreaThumb />
        </ColorPicker.Area>
        <ColorPicker.HueSlider>
          <ColorPicker.HueSliderTrack />
          <ColorPicker.HueSliderThumb />
        </ColorPicker.HueSlider>
        <ColorPicker.Input />
      </ColorPicker.Content>
    </ColorPicker>
  );
}
```

Supported gradient types: `linear`, `radial`, `conic`, and `mesh`.

### Color Tokens

The picker supports named color tokens. Tokens can be provided manually or auto-detected from CSS custom properties:

```tsx
// Manual tokens
<ColorPicker
  value="brand-primary"
  onValueChange={setValue}
  tokens={{
    "brand-primary": "#3b82f6",
    "brand-secondary": "#8b5cf6",
    danger: "#ef4444",
  }}
/>

// Auto-detect CSS custom properties from :root / html
<ColorPicker value={color} onValueChange={setColor} autoTokens />

// Auto-detect with prefix filter (strips prefix from display names)
<ColorPicker value={color} onValueChange={setColor} autoTokens={{ prefix: "--brand-" }} />

// Disable auto-detection (enabled by default)
<ColorPicker value={color} onValueChange={setColor} autoTokens={false} />
```

When tokens are available, the input field shows a token badge. Clicking it opens a searchable dropdown listing all tokens.

### Input Trigger

Use `ColorPickerInputTrigger` (or `triggerMode="input"` on presets) for an input-style trigger that shows the color value inline:

```tsx
<ColorPicker value={color} onValueChange={setColor}>
  <ColorPickerInputTrigger />
  <ColorPicker.Content>
    {/* ... controls ... */}
  </ColorPicker.Content>
</ColorPicker>
```

### Contrast Checking (WCAG)

Both presets render a contrast-info row and a threshold line across the color area when a `contrastColor` is passed:

```tsx
<ColorPickerPopover
  value={color}
  onValueChange={setColor}
  contrastColor="#ffffff"
  onContrastColorChange={setBg}
/>
```

For the composable API, place `ColorPickerContrastInfo` where you want the ratio readout and `ColorPickerContrastLine` inside `ColorPickerArea` between the gradient and the thumb:

```tsx
<ColorPicker value={color} onValueChange={setColor}>
  <ColorPickerContrastInfo contrastColor="#ffffff" onContrastColorChange={setBg} />
  <ColorPickerArea>
    <ColorPickerAreaGradient />
    <ColorPickerContrastLine contrastColor="#ffffff" />
    <ColorPickerAreaThumb />
  </ColorPickerArea>
  {/* ... */}
</ColorPicker>
```

`ColorPickerContrastInfo` shows the current ratio (e.g. `5.23 : 1`) and a WCAG level badge (`AAA`, `AA`, `AA18`, or `Insufficient`). `ColorPickerContrastLine` renders an SVG curve along the 4.5:1 threshold inside the saturation/brightness area, with a dot pattern in the failing region. Pass `threshold={3}` to target AA Large.

### ColorPickerProvider (advanced)

`ColorPickerProvider` is a context-only wrapper (no Radix `Popover.Root`) that manages a single solid color. Use it when you need to embed color-picker controls inside another popover — for example, a per-stop color editor inside the gradient editor's own popover. For standard usage, prefer `ColorPicker`.

## Styling

The library ships unstyled primitives. There are three ways to style them:

### 1. CSS Custom Properties Theme (recommended for most apps)

Import the included stylesheet for a complete, themeable look:

```tsx
import "@markoradak/color-picker/styles";
```

Override CSS custom properties to match your design system:

```css
.my-theme {
  --cp-bg: #1a1a2e;
  --cp-border: #2a2a4a;
  --cp-border-focus: #60a5fa;
  --cp-text: #f5f5f5;
  --cp-radius: 12px;
  --cp-width: 280px;
}
```

### 2. Tailwind CSS Classes

Pass Tailwind classes via `className` and `classNames` props:

```tsx
<ColorPickerArea className="relative h-44 w-full cursor-crosshair rounded-lg">
  <ColorPickerAreaGradient className="rounded-lg" />
  <ColorPickerAreaThumb className="h-4 w-4 rounded-full border-2 border-white shadow" />
</ColorPickerArea>
```

Components with multiple inner elements expose a `classNames` prop:

```tsx
<ColorPickerInput
  className="flex items-center gap-1"
  classNames={{
    formatToggle: "rounded-md border px-2 h-8 text-xs",
    field: "w-full rounded-md border px-2 h-8 text-sm",
  }}
/>
```

### 3. Unstyled (fully custom)

Use the components without importing any styles and target them with CSS selectors:

```css
[data-cp-part="area"] { /* ... */ }
[data-cp-part="hue-slider"] [data-cp-el="thumb"] { /* ... */ }
```

All components render `data-cp-part` and `data-cp-el` attributes for CSS targeting.

## API Reference

### Components

| Component | Dot Notation | Description |
|---|---|---|
| `ColorPicker` | - | Root provider. Wraps children in context and Radix Popover. |
| `ColorPickerTrigger` | `ColorPicker.Trigger` | Button that opens the popover. Displays current color swatch. |
| `ColorPickerInputTrigger` | - | Input-style trigger with thumbnail, text input, format toggle, and eye dropper. |
| `ColorPickerContent` | `ColorPicker.Content` | Popover content container with positioning. |
| `ColorPickerArea` | `ColorPicker.Area` | 2D saturation/brightness picker container. |
| `ColorPickerAreaGradient` | `ColorPicker.AreaGradient` | Renders the white-to-black gradient overlays inside the area. |
| `ColorPickerAreaThumb` | `ColorPicker.AreaThumb` | Draggable thumb positioned by saturation and brightness. |
| `ColorPickerHueSlider` | `ColorPicker.HueSlider` | Hue slider container (0-360). |
| `ColorPickerHueSliderTrack` | `ColorPicker.HueSliderTrack` | Rainbow gradient track. |
| `ColorPickerHueSliderThumb` | `ColorPicker.HueSliderThumb` | Draggable hue thumb. |
| `ColorPickerAlphaSlider` | `ColorPicker.AlphaSlider` | Alpha slider container (0-1). |
| `ColorPickerAlphaSliderTrack` | `ColorPicker.AlphaSliderTrack` | Checkerboard + alpha gradient track. |
| `ColorPickerAlphaSliderThumb` | `ColorPicker.AlphaSliderThumb` | Draggable alpha thumb. |
| `ColorPickerInput` | `ColorPicker.Input` | Text input showing color in current format. Validates on blur/Enter. |
| `ColorPickerFormatToggle` | `ColorPicker.FormatToggle` | Cycles between HEX, RGB, and HSL display formats. |
| `ColorPickerEyeDropper` | `ColorPicker.EyeDropper` | Browser EyeDropper API button. Renders nothing in unsupported browsers. |
| `ColorPickerSwatches` | `ColorPicker.Swatches` | Grid container for preset color swatches. |
| `ColorPickerSwatch` | `ColorPicker.Swatch` | Individual color swatch button. |
| `ColorPickerModeSelector` | `ColorPicker.ModeSelector` | Segmented control for switching between solid and gradient modes. |
| `ColorPickerModeSelectorItem` | `ColorPicker.ModeSelectorItem` | Individual mode button (solid, linear, radial, conic, mesh). |
| `ColorPickerGradientEditor` | `ColorPicker.GradientEditor` | Self-contained gradient editing UI with preview and stop manipulation. |
| `ColorPickerGradientSwatches` | `ColorPicker.GradientSwatches` | Grid container for preset gradient swatches. |
| `ColorPickerGradientSwatch` | `ColorPicker.GradientSwatch` | Individual gradient swatch button. |
| `ColorPickerContrastInfo` | `ColorPicker.ContrastInfo` | WCAG contrast-ratio readout with level badge. Optionally opens a mini picker to change the reference color. |
| `ColorPickerContrastLine` | `ColorPicker.ContrastLine` | SVG overlay for `ColorPickerArea` that draws the WCAG threshold curve and a dot pattern in the failing region. |
| `GradientPreview` | - | Lower-level gradient preview with stop dots and drag handles. |
| `GradientStops` | - | Lower-level horizontal stop bar with draggable markers. |
| `TokenList` | - | Lower-level searchable token list dropdown. |
| `ColorPickerProvider` | `ColorPicker.Provider` | Context-only provider for solid colors (no Popover.Root). Used internally for per-stop color editing in gradient mode. |

### Presets

Pre-composed components that bundle all controls together:

| Component | Description |
|---|---|
| `ColorPickerPopover` | Trigger + popover with all controls. |
| `ColorPickerInline` | Always-visible picker with all controls. |
| `ColorPickerControls` | Shared inner controls used by both presets. Can be used standalone inside a `ColorPicker` or `ColorPickerProvider`. |

Import from `@markoradak/color-picker/presets` or from the main entry.

### ColorPicker Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `ColorPickerValue` | - | Controlled value (string or GradientValue). |
| `onValueChange` | `(value: ColorPickerValue) => void` | - | Called when value changes. |
| `defaultValue` | `ColorPickerValue` | `"#000000"` | Initial value for uncontrolled mode. |
| `disabled` | `boolean` | `false` | Disables all interactions. |
| `defaultOpen` | `boolean` | `false` | Whether the popover starts open (uncontrolled). |
| `tokens` | `ColorTokens` | - | Map of semantic token names to color values. |
| `autoTokens` | `AutoTokensConfig` | `true` | Auto-detect CSS custom property color tokens. `true` = detect all, `false` = disable, `{ prefix: "--brand-" }` = filter by prefix. |
| `children` | `ReactNode` | - | Compound sub-components. |

### ColorPickerPopover Props

Includes all props from `ColorPickerPresetProps` plus popover-specific options:

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `ColorPickerValue` | - | Controlled value. |
| `onValueChange` | `(value: ColorPickerValue) => void` | - | Value change callback. |
| `defaultValue` | `ColorPickerValue` | `"#000000"` | Initial uncontrolled value. |
| `disabled` | `boolean` | `false` | Disables all interactions. |
| `enableAlpha` | `boolean` | `true` | Show the alpha/opacity slider. |
| `enableGradient` | `boolean` | `true` | Show gradient editor controls. |
| `enableModeSelector` | `boolean` | `true` when `enableGradient` is true | Show the solid/gradient mode selector. |
| `enableEyeDropper` | `boolean` | `true` | Show EyeDropper button. |
| `enableFormatToggle` | `boolean` | `true` | Show format cycle button. |
| `enableTokenSearch` | `boolean` | `true` | Show search input in token dropdown. |
| `enableSwatches` | `boolean` | `true` | Show preset swatches. |
| `swatches` | `string[]` | Built-in palette | Preset swatch colors (solid mode). |
| `swatchColumns` | `number` | `8` | Grid columns for swatches. |
| `gradientSwatches` | `GradientValue[]` | - | Preset gradient swatches (gradient mode). |
| `contrastColor` | `string` | - | Reference color for the WCAG contrast row and threshold line (solid mode). When provided, contrast UI is rendered; omit to hide. |
| `onContrastColorChange` | `(color: string) => void` | - | Called when the user changes the reference color via the contrast-indicator popover. |
| `tokens` | `ColorTokens` | - | Map of semantic token names to color values. |
| `autoTokens` | `AutoTokensConfig` | `true` | Auto-detect CSS custom property tokens. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Popover placement. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Popover alignment. |
| `sideOffset` | `number` | `4` | Offset from trigger (px). |
| `trigger` | `ReactNode` | - | Custom trigger element (wraps in `ColorPickerTrigger asChild`). |
| `triggerMode` | `"thumbnail" \| "input"` | `"thumbnail"` | Trigger style. `"input"` renders `ColorPickerInputTrigger`. Ignored when `trigger` is provided. |
| `className` | `string` | - | Additional CSS class on the wrapper. |

### ColorPickerInline Props

Same as `ColorPickerPopover` except without `side`, `align`, `sideOffset`, `trigger`, and `triggerMode`.

### Utilities

| Function | Description |
|---|---|
| `toCSS(value)` | Convert a `ColorPickerValue` to a CSS string. |
| `fromCSS(css)` | Parse a CSS gradient string into a `ColorPickerValue`. Supports `linear-gradient`, `radial-gradient`, `conic-gradient`, and `repeating-*` variants. Returns the raw string for unparseable input. |
| `isGradient(value)` | Type guard: is the value a gradient object? |
| `isSolidColor(value)` | Type guard: is the value a solid color string? |
| `formatColor(input, format)` | Convert a color string to hex/rgb/hsl. |
| `detectFormat(input)` | Detect the format of a color string. |
| `parseColor(input)` | Parse any color string into a colord instance. |
| `isValidColor(input)` | Check if a string is a valid color. |
| `toHSVA(input)` | Convert a color string to HSVA. Returns white for invalid input. |
| `fromHSVA(hsva)` | Convert HSVA values back to a hex string. |
| `getContrastColor(bg)` | Returns `"black"` or `"white"` for best contrast against the given background. |
| `contrastRatio(a, b)` | Compute the WCAG 2.1 contrast ratio between two colors (1–21). |
| `getWcagLevel(ratio)` | Classify a ratio as `"AAA"`, `"AA"`, `"AA18"` (large text), or `"Fail"`. Exported as type `WcagLevel`. |
| `getEffectiveBackgroundColor(element)` | Walk up the DOM from `element` and return the first non-transparent background color (falls back to white). |
| `colorLuminance(color)` | Relative luminance of any CSS color string (0–1). |
| `hsvLuminance(h, s, v, a)` | Relative luminance for HSVA values — useful for computing contrast boundaries across the picker area. |
| `contrastFromLuminances(l1, l2)` | Contrast ratio from two pre-computed luminances. |
| `resolveToken(value, tokens)` | Resolve a token name to its color value via the tokens map. Returns the value unchanged if not found. |
| `findMatchingToken(hex, tokens)` | Find the token name whose resolved color matches the given hex. |
| `getCSSColorTokens(prefix?)` | Scan the DOM for CSS custom properties that resolve to valid colors. |
| `createDefaultGradient(type)` | Create a default gradient of the given type. |
| `createDefaultGradientFromColor(type, color)` | Create a gradient from an existing color. |
| `createGradientStop(color, position)` | Create a gradient stop object with a generated ID. |
| `createMeshGradientStop(color, position, x, y)` | Create a mesh gradient stop with 2D coordinates. |
| `interpolateColorAt(stops, position)` | Interpolate a color at a position along the gradient. |
| `addStop(gradient, color, position)` | Add a stop to a gradient (returns new gradient). |
| `addStopWithCoordinates(gradient, color, position, x, y)` | Mesh-only: add a stop with explicit 2D coordinates. |
| `removeStop(gradient, stopId)` | Remove a stop by ID (returns new gradient). |
| `updateStop(gradient, stopId, updates)` | Update a stop's color or position (returns new gradient). |
| `moveStop(gradient, stopId, direction)` | Reorder a stop (mesh only): `"front"`, `"forward"`, `"backward"`, `"back"`. |
| `sortStops(stops)` | Sort stops by position (returns new array). |
| `clamp(n, min, max)` | Constrain a number to a range. |
| `getRelativePosition(event, element)` | Pointer position inside an element normalized to 0–1 on each axis. |
| `angleFromPosition(cx, cy, x, y)` | Angle in degrees from a center point to an `(x, y)` coordinate. |

### Hooks

| Hook | Description |
|---|---|
| `useColorPicker(options)` | Core state management hook. Manages HSVA state, format cycling, controlled/uncontrolled value, and token resolution. |
| `useGradient(options)` | Gradient state management. Manages active stop, stop CRUD, and gradient replacement. |
| `usePointerDrag(options)` | Generic pointer drag hook used by Area and Slider components. |
| `useAutoTokens(config, manualTokens)` | Merges auto-detected CSS custom property tokens with manually provided tokens. |
| `useTokenDropdown(options)` | State machine for the token dropdown: open/close, search, keyboard navigation, click-outside dismissal. |

### Types

```ts
type SolidColor = string;
type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";
type GradientType = "linear" | "radial" | "conic" | "mesh";
type ColorPickerMode = "solid" | GradientType;
type ColorPickerValue = SolidColor | GradientValue;
type ColorTokens = Record<string, string>;
type AutoTokensConfig = { prefix?: string } | boolean;

// GradientValue is a discriminated union -- switch on `value.type`
type GradientValue =
  | LinearGradientValue
  | RadialGradientValue
  | ConicGradientValue
  | MeshGradientValue;

interface LinearGradientValue {
  type: "linear";
  stops: GradientStop[];
  angle: number; // degrees
}

interface RadialGradientValue {
  type: "radial";
  stops: GradientStop[];
  centerX: number; // 0-100
  centerY: number; // 0-100
}

interface ConicGradientValue {
  type: "conic";
  stops: GradientStop[];
  angle: number; // degrees
  centerX: number; // 0-100
  centerY: number; // 0-100
}

interface MeshGradientValue {
  type: "mesh";
  stops: MeshGradientStop[];
  baseColor?: string; // solid color behind radial blobs
}

interface GradientStop {
  id: string;
  color: string;
  position: number; // 0-100
}

interface MeshGradientStop {
  id: string;
  color: string;
  position: number; // 0-100
  x: number; // 0-100
  y: number; // 0-100
}

interface HSVA {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}
```

## CSS Theming

Import the default stylesheet and override CSS custom properties:

```css
@import "@markoradak/color-picker/styles";

.my-theme {
  --cp-bg: #1a1a2e;
  --cp-border: #2a2a4a;
  --cp-border-focus: #60a5fa;
  --cp-text: #f5f5f5;
  --cp-radius: 12px;
  --cp-width: 280px;
}
```

### Dark Mode

Dark mode is applied automatically via `prefers-color-scheme: dark`. You can also use a `.dark` class on any ancestor element for manual toggling:

```html
<div class="dark">
  <!-- All color pickers inside will use dark theme -->
</div>
```

### Available Custom Properties

| Property | Default (Light) | Description |
|---|---|---|
| `--cp-bg` | `#ffffff` | Panel background |
| `--cp-bg-secondary` | `#fafafa` | Secondary background (mode selector, token badge) |
| `--cp-border` | `#e5e5e5` | Border color |
| `--cp-border-focus` | `#3b82f6` | Focus ring / active indicator color |
| `--cp-radius` | `0.75rem` | Border radius (panel) |
| `--cp-radius-sm` | `0.5rem` | Border radius (controls) |
| `--cp-radius-full` | `9999px` | Border radius (thumbs, swatches) |
| `--cp-text` | `#171717` | Primary text color |
| `--cp-text-muted` | `#737373` | Muted text color |
| `--cp-input-bg` | `#ffffff` | Input background |
| `--cp-input-border` | `#d4d4d4` | Input border |
| `--cp-shadow` | - | Panel box-shadow |
| `--cp-shadow-sm` | - | Small box-shadow (mode selector active) |
| `--cp-ring` | `0 0 0 2px var(--cp-border-focus)` | Focus ring box-shadow |
| `--cp-ring-offset` | `2px` | Focus ring outline offset |
| `--cp-hover-bg` | `#f5f5f5` | Hover background |
| `--cp-active-border` | `#1f2937` | Active swatch border |
| `--cp-width` | `18rem` | Panel width |
| `--cp-area-height` | `11rem` | Color area height |
| `--cp-slider-height` | `0.75rem` | Slider track height |
| `--cp-thumb-size` | `1rem` | Thumb size |
| `--cp-swatch-size` | `1.75rem` | Swatch button size |
| `--cp-gap` | `0.75rem` | Spacing between controls |
| `--cp-padding` | `0.75rem` | Panel padding |
| `--cp-checkerboard-color` | `#e5e5e5` | Checkerboard pattern color |
| `--cp-z-index-dropdown` | `50` | z-index for dropdowns |
| `--cp-z-index-portal` | `99999` | z-index for portals |
| `--cp-font-family` | `monospace` | Font for color value inputs |
| `--cp-transition-duration` | `0.15s` | Transition duration (respects `prefers-reduced-motion`) |

## Accessibility

- Full keyboard navigation (arrow keys, Enter, Escape, Tab)
- ARIA roles and labels on all interactive elements
- `prefers-reduced-motion: reduce` disables all animations
- Focus-visible rings on all focusable elements
- Screen reader announcements for color changes

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- The EyeDropper button uses the [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API) (Chromium-based browsers). It automatically hides in unsupported browsers.

## Development

This package lives in a pnpm + Turborepo monorepo alongside a Next.js demo site. Requires Node 18+ and pnpm 10+.

```
packages/
  react/          @markoradak/color-picker — this package
apps/
  web/            Next.js demo + playground site
```

```bash
pnpm install
pnpm dev          # tsup --watch + next dev, concurrently
pnpm build        # build the package, then the demo site
pnpm test         # 261 tests in packages/react
pnpm typecheck    # typecheck all workspaces
```

## License

MIT
