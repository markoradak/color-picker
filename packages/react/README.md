# @markoradak/color-picker

A compound-component React color picker and gradient editor. Built with Radix primitives, fully accessible, and themeable via CSS custom properties.

## Installation

```bash
# pnpm
pnpm add @markoradak/color-picker

# npm
npm install @markoradak/color-picker

# yarn
yarn add @markoradak/color-picker
```

**Peer dependencies**: `react >= 18.0.0` and `react-dom >= 18.0.0`

## Quick Start

### Compound Component (full control)

Build your own layout by composing individual sub-components:

```tsx
import { useState } from "react";
import { ColorPicker } from "@markoradak/color-picker";
import "@markoradak/color-picker/styles.css";

function MyColorPicker() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <ColorPicker.Trigger />
      <ColorPicker.Content>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.AlphaSlider />
        <div style={{ display: "flex", gap: 8 }}>
          <ColorPicker.Input />
          <ColorPicker.FormatToggle />
          <ColorPicker.EyeDropper />
        </div>
        <ColorPicker.Swatches
          colors={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"]}
        />
      </ColorPicker.Content>
    </ColorPicker>
  );
}
```

### Pre-composed Popover

A ready-to-use popover picker with all controls included:

```tsx
import { useState } from "react";
import { ColorPickerPopover } from "@markoradak/color-picker/presets";
import "@markoradak/color-picker/styles.css";

function App() {
  const [color, setColor] = useState("#3b82f6");

  return (
    <ColorPickerPopover
      value={color}
      onValueChange={setColor}
      enableAlpha
      enableEyeDropper
      swatches={["#ef4444", "#22c55e", "#3b82f6"]}
    />
  );
}
```

### Pre-composed Inline

An always-visible picker (no popover):

```tsx
import { ColorPickerInline } from "@markoradak/color-picker/presets";
import "@markoradak/color-picker/styles.css";

<ColorPickerInline
  value={color}
  onValueChange={setColor}
  enableAlpha
  enableFormatToggle
/>
```

### Gradient Picker

Pass a `GradientValue` object instead of a string to enable gradient editing:

```tsx
import { useState } from "react";
import { ColorPicker, createDefaultGradient } from "@markoradak/color-picker";
import type { ColorPickerValue } from "@markoradak/color-picker";
import "@markoradak/color-picker/styles.css";

function GradientPicker() {
  const [value, setValue] = useState<ColorPickerValue>(
    createDefaultGradient("linear")
  );

  return (
    <ColorPicker value={value} onValueChange={setValue}>
      <ColorPicker.Trigger />
      <ColorPicker.Content>
        <ColorPicker.GradientEditor />
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.AlphaSlider />
        <ColorPicker.Input />
      </ColorPicker.Content>
    </ColorPicker>
  );
}
```

Supported gradient types: `linear`, `radial`, `conic`, and `mesh`.

## API Reference

### Components

| Component | Description |
|---|---|
| `<ColorPicker>` | Root provider. Wraps children in context and Radix Popover. |
| `<ColorPicker.Trigger>` | Button that opens the popover. Displays current color swatch. |
| `<ColorPicker.Content>` | Popover content container with positioning and animations. |
| `<ColorPicker.Area>` | 2D saturation/brightness picker. Arrow key navigable. |
| `<ColorPicker.HueSlider>` | Horizontal hue slider (0-360). |
| `<ColorPicker.AlphaSlider>` | Horizontal opacity slider (0-1). |
| `<ColorPicker.Input>` | Text input showing color in current format. Validates on blur/Enter. |
| `<ColorPicker.FormatToggle>` | Cycles between HEX, RGB, and HSL display formats. |
| `<ColorPicker.EyeDropper>` | Browser EyeDropper API button. Auto-hidden if unsupported. |
| `<ColorPicker.Swatches>` | Grid of preset color swatch buttons. |
| `<ColorPicker.GradientEditor>` | Full gradient editing UI (type selector, stops, preview). |

### ColorPicker Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `ColorPickerValue` | - | Controlled value (string or GradientValue). |
| `onValueChange` | `(value: ColorPickerValue) => void` | - | Called when value changes. |
| `defaultValue` | `ColorPickerValue` | `"#000000"` | Initial value for uncontrolled mode. |
| `disabled` | `boolean` | `false` | Disables all interactions. |
| `children` | `ReactNode` | - | Compound sub-components. |

### ColorPickerPopover Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `ColorPickerValue` | - | Controlled value. |
| `onValueChange` | `(value: ColorPickerValue) => void` | - | Value change callback. |
| `defaultValue` | `ColorPickerValue` | `"#000000"` | Initial uncontrolled value. |
| `disabled` | `boolean` | `false` | Disables all interactions. |
| `enableAlpha` | `boolean` | `true` | Show the alpha/opacity slider. |
| `enableGradient` | `boolean` | `false` | Show gradient editor controls. |
| `enableEyeDropper` | `boolean` | `true` | Show EyeDropper button. |
| `enableFormatToggle` | `boolean` | `true` | Show format cycle button. |
| `swatches` | `string[]` | - | Array of preset colors. |
| `swatchColumns` | `number` | `8` | Grid columns for swatches. |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Popover placement. |
| `align` | `"start" \| "center" \| "end"` | `"center"` | Popover alignment. |
| `sideOffset` | `number` | `4` | Offset from trigger (px). |
| `trigger` | `ReactNode` | - | Custom trigger element. |
| `className` | `string` | - | Additional CSS class. |

### ColorPickerInline Props

Same as `ColorPickerPopover` except without `side`, `align`, `sideOffset`, and `trigger`.

### Utilities

| Function | Description |
|---|---|
| `toCSS(value)` | Convert a `ColorPickerValue` to a CSS string. |
| `fromCSS(css)` | Parse a CSS string into a `ColorPickerValue`. |
| `isGradient(value)` | Type guard: is the value a gradient object? |
| `isSolidColor(value)` | Type guard: is the value a solid color string? |
| `formatColor(input, format)` | Convert a color string between hex/rgb/hsl. |
| `parseColor(input)` | Parse any color string into a colord instance. |
| `isValidColor(input)` | Check if a string is a valid color. |
| `createDefaultGradient(type)` | Create a default gradient of the given type. |
| `createGradientStop(color, position)` | Create a gradient stop object. |

### Types

```ts
type SolidColor = string;
type ColorFormat = "hex" | "rgb" | "hsl";
type ColorPickerValue = SolidColor | GradientValue;

interface GradientValue {
  type: "linear" | "radial" | "conic" | "mesh";
  stops: GradientStop[];
  angle?: number;
  centerX?: number;
  centerY?: number;
}

interface GradientStop {
  id: string;
  color: string;
  position: number;
  x?: number; // mesh only
  y?: number; // mesh only
}
```

## CSS Theming

Import the default styles and override CSS custom properties to match your design system:

```css
@import "@markoradak/color-picker/styles.css";

/* Custom theme */
.my-theme {
  --cp-bg: #1a1a2e;
  --cp-bg-secondary: #16213e;
  --cp-border: #2a2a4a;
  --cp-border-focus: #60a5fa;
  --cp-text: #f5f5f5;
  --cp-text-muted: #a1a1aa;
  --cp-input-bg: #27272a;
  --cp-input-border: #3f3f46;
  --cp-radius: 12px;
  --cp-width: 280px;
}
```

### Available Custom Properties

| Property | Default (Light) | Description |
|---|---|---|
| `--cp-bg` | `#ffffff` | Panel background |
| `--cp-bg-secondary` | `#fafafa` | Secondary background |
| `--cp-border` | `#e5e5e5` | Border color |
| `--cp-border-focus` | `#3b82f6` | Focus border color |
| `--cp-radius` | `0.75rem` | Border radius (panel) |
| `--cp-radius-sm` | `0.5rem` | Border radius (controls) |
| `--cp-text` | `#171717` | Primary text |
| `--cp-text-muted` | `#737373` | Muted text |
| `--cp-input-bg` | `#ffffff` | Input background |
| `--cp-input-border` | `#d4d4d4` | Input border |
| `--cp-shadow` | - | Panel shadow |
| `--cp-width` | `16rem` | Panel width |
| `--cp-area-height` | `10rem` | Color area height |
| `--cp-slider-height` | `0.75rem` | Slider track height |
| `--cp-swatch-size` | `1.5rem` | Swatch button size |
| `--cp-gap` | `0.75rem` | Spacing between controls |
| `--cp-padding` | `0.75rem` | Panel padding |

Dark mode is applied automatically via `prefers-color-scheme: dark`.

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- The EyeDropper button uses the [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API) which is supported in Chromium-based browsers. The button auto-hides in browsers that don't support it.

## License

MIT
