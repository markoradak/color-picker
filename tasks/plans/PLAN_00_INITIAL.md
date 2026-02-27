# PLAN_00_INITIAL: @markoradak/color-picker

**Created**: 2026-02-27
**Status**: Draft
**Project**: Compound-component React color picker + gradient picker library

---

## Overview

A production-quality React color picker and gradient editor published as `@markoradak/color-picker` on npm. Built with a compound-component API (Radix-style), structured value types (not CSS strings), and a monorepo housing both the library and a Next.js demo/docs site.

## Architecture

- **Monorepo**: pnpm workspaces + Turborepo
- **Library**: `packages/react/` -- published as `@markoradak/color-picker`
- **Demo site**: `apps/web/` -- Next.js App Router
- **Bundler**: tsup (ESM + CJS dual output)
- **Styling**: Tailwind CSS v4 + CSS custom properties
- **Color math**: colord (~1.7kB, plugin-based) -- HEX/RGB/HSL only (no OKLCH)
- **Positioning**: @radix-ui/react-popover
- **Testing**: Vitest + @testing-library/react

## Value System

The library uses **structured values**, not raw CSS strings:

```typescript
type SolidColor = string; // "#ff0000", "rgb(255,0,0)", "hsl(0,100%,50%)"

interface GradientValue {
  type: 'linear' | 'radial' | 'conic' | 'mesh';
  stops: GradientStop[];
  angle?: number;
  centerX?: number;
  centerY?: number;
}

interface GradientStop {
  id: string;
  color: string;
  position: number; // 0-100
  x?: number;       // mesh only
  y?: number;       // mesh only
}

type ColorPickerValue = SolidColor | GradientValue;
```

## Compound Component API

```tsx
<ColorPicker value={color} onValueChange={setColor}>
  <ColorPicker.Trigger />
  <ColorPicker.Content>
    <ColorPicker.Area />
    <ColorPicker.HueSlider />
    <ColorPicker.AlphaSlider />
    <ColorPicker.Input />
    <ColorPicker.EyeDropper />
    <ColorPicker.Swatches colors={[...]} />
    <ColorPicker.GradientEditor />
  </ColorPicker.Content>
</ColorPicker>
```

---

## Phase 1: Foundation & Project Scaffolding

**Goal**: Get the monorepo building and a minimal "hello world" component publishable.

### Tasks

- [ ] **1.1** Initialize monorepo root
  - `pnpm-workspace.yaml` defining `packages/*` and `apps/*`
  - Root `package.json` with workspace scripts (`dev`, `build`, `test`, `lint`)
  - `turbo.json` with pipeline for `build`, `dev`, `test`, `lint`
  - Base `tsconfig.json` (strict mode, ESNext, moduleResolution bundler)
  - `.gitignore` (node_modules, dist, .next, .turbo, .env)
  - `.npmrc` for pnpm settings

- [ ] **1.2** Scaffold `packages/react/`
  - `package.json` with name `@markoradak/color-picker`, `main`, `module`, `types`, `exports` map
  - `tsconfig.json` extending root, with `jsx: react-jsx`, paths for `@/`
  - `tsup.config.ts` producing ESM + CJS + declaration files
  - `src/index.ts` with placeholder export
  - Peer dependencies: `react`, `react-dom`, `tailwindcss`
  - Dependencies: `colord`, `@radix-ui/react-popover`
  - Dev dependencies: `tsup`, `typescript`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `react`, `react-dom`

- [ ] **1.3** Scaffold `apps/web/`
  - Create Next.js app with App Router (TypeScript, Tailwind CSS v4, no src dir)
  - Add workspace dependency on `@markoradak/color-picker`
  - Basic `app/layout.tsx` and `app/page.tsx`
  - `next.config.ts` with `transpilePackages: ['@markoradak/color-picker']`

- [ ] **1.4** Verify build pipeline
  - `pnpm build` from root builds library then web app
  - `pnpm dev` starts both in parallel
  - `pnpm test` runs vitest in library package

### Deliverables
- Monorepo structure builds end-to-end
- Library produces `dist/` with ESM, CJS, and `.d.ts`
- Demo site imports and renders a placeholder component from the library

### Estimated Effort: 1-2 hours

---

## Phase 2: Core Types & Color Utilities

**Goal**: Establish the type system and color manipulation layer.

### Tasks

- [ ] **2.1** Define TypeScript types (`src/types.ts`)
  - `SolidColor` type alias
  - `GradientStop` interface (id, color, position, x?, y?)
  - `GradientValue` interface (type, stops, angle?, centerX?, centerY?)
  - `ColorPickerValue` union type
  - `ColorFormat` type: `'hex' | 'rgb' | 'hsl'`
  - `ColorPickerProps` interface (value, onValueChange, defaultValue, disabled, etc.)
  - Component-specific prop interfaces

- [ ] **2.2** Color utilities (`src/utils/color.ts`)
  - `parseColor(input: string): Colord` -- parse any supported format
  - `formatColor(color: Colord, format: ColorFormat): string` -- output in specified format
  - `detectFormat(input: string): ColorFormat` -- detect which format a string is in
  - `isValidColor(input: string): boolean` -- validate color string
  - `getHSVA(color: string): { h, s, v, a }` -- convert to HSV for the area picker
  - `fromHSVA(hsva: { h, s, v, a }): string` -- convert HSV back to hex
  - `getContrastColor(bg: string): 'black' | 'white'` -- for text on swatch
  - Install colord plugins: `names`, `a11y`

- [ ] **2.3** Gradient utilities (`src/utils/gradient.ts`)
  - `createGradientStop(color: string, position: number): GradientStop` -- with auto-generated id
  - `sortStops(stops: GradientStop[]): GradientStop[]` -- sort by position
  - `addStop(gradient: GradientValue, color: string, position: number): GradientValue`
  - `removeStop(gradient: GradientValue, stopId: string): GradientValue`
  - `updateStop(gradient: GradientValue, stopId: string, updates: Partial<GradientStop>): GradientValue`
  - `createDefaultGradient(type: GradientValue['type']): GradientValue`

- [ ] **2.4** CSS conversion utilities (`src/utils/css.ts`)
  - `toCSS(value: ColorPickerValue): string` -- structured value to CSS string
  - `fromCSS(css: string): ColorPickerValue` -- CSS string to structured value
  - `isGradient(value: ColorPickerValue): value is GradientValue` -- type guard
  - `isSolidColor(value: ColorPickerValue): value is SolidColor` -- type guard

- [ ] **2.5** Position utilities (`src/utils/position.ts`)
  - `clamp(value: number, min: number, max: number): number`
  - `getRelativePosition(event: PointerEvent, element: HTMLElement): { x, y }` -- normalized 0-1
  - `angleFromPosition(x: number, y: number, centerX: number, centerY: number): number` -- for conic gradients

- [ ] **2.6** Unit tests for all utilities
  - Color parsing, formatting, conversion tests
  - Gradient CRUD operation tests
  - CSS serialization/deserialization roundtrip tests
  - Position math tests

### Deliverables
- Complete type system
- Battle-tested utility functions with full test coverage
- CSS roundtrip conversion working for all gradient types

### Estimated Effort: 3-4 hours

---

## Phase 3: Core Hooks & State Management

**Goal**: Build the state management layer that powers all components.

### Tasks

- [ ] **3.1** `usePointerDrag` hook (`src/hooks/use-pointer-drag.ts`)
  - Tracks pointer down/move/up on an element
  - Returns normalized `{ x, y }` position (0-1) relative to element
  - Handles pointer capture for smooth drag outside element bounds
  - Supports both mouse and touch events
  - Returns `isDragging` boolean for styling
  - Memoized event handlers

- [ ] **3.2** `useColorPicker` hook (`src/hooks/use-color-picker.ts`)
  - Controlled/uncontrolled value support (value + onValueChange + defaultValue)
  - Internal HSV state for smooth dragging (no color rounding during drag)
  - Sync external value changes to internal HSV state
  - `setHue(h: number)`, `setSaturationValue(s: number, v: number)`, `setAlpha(a: number)`
  - `setColorFromString(input: string)`
  - `currentFormat` state with `setFormat` toggle
  - `formattedValue` computed from current format
  - `cssValue` computed CSS string
  - `isGradientMode` boolean

- [ ] **3.3** `useGradient` hook (`src/hooks/use-gradient.ts`)
  - Manages GradientValue state
  - `activeStopId` state -- which stop is being edited
  - `setActiveStop(id: string)`, `addStop()`, `removeStop(id: string)`
  - `updateStopColor(id: string, color: string)`, `updateStopPosition(id: string, position: number)`
  - `setGradientType(type)`, `setAngle(angle)`, `setCenter(x, y)`
  - Derive CSS preview string from current gradient state

- [ ] **3.4** Context system (`src/components/color-picker.tsx` -- context only)
  - `ColorPickerContext` with all hook return values
  - `ColorPickerProvider` wrapping `useColorPicker` + `useGradient`
  - `useColorPickerContext()` consumer hook with error boundary

- [ ] **3.5** Tests for hooks
  - `usePointerDrag` with simulated pointer events
  - `useColorPicker` controlled/uncontrolled modes
  - `useGradient` CRUD operations
  - Context provider/consumer integration

### Deliverables
- All hooks working in isolation with tests
- Context system ready for components to consume

### Estimated Effort: 4-5 hours

---

## Phase 4: Solid Color Picker Components

**Goal**: Build all solid-color components with the compound pattern.

### Tasks

- [ ] **4.1** `<ColorPicker>` root component (`src/components/color-picker.tsx`)
  - Renders `ColorPickerProvider` wrapping children
  - Accepts `value`, `onValueChange`, `defaultValue`, `disabled`
  - Attaches compound sub-components as static properties (ColorPicker.Trigger, etc.)

- [ ] **4.2** `<ColorPicker.Trigger>` (`src/components/trigger.tsx`)
  - Button showing current color as swatch
  - Uses `Popover.Trigger` from Radix
  - Shows checkerboard for transparent colors
  - `asChild` support for custom trigger elements
  - Applies `data-disabled` when picker is disabled

- [ ] **4.3** `<ColorPicker.Content>` (`src/components/content.tsx`)
  - Wraps children in `Popover.Content` from Radix
  - Configurable `side`, `align`, `sideOffset`
  - Styled container with shadow, border, border-radius
  - Animation (fade + scale) via CSS transitions
  - Portal rendering via Radix

- [ ] **4.4** `<ColorPicker.Area>` (`src/components/area.tsx`)
  - 2D saturation/lightness picker
  - Background: layered CSS gradients (white-to-transparent left-right, transparent-to-black top-bottom, solid hue behind)
  - Draggable indicator dot positioned via `usePointerDrag`
  - Updates S/V in context on drag
  - Keyboard support: arrow keys to move indicator
  - `aria-label`, `role="slider"`, `aria-valuetext`

- [ ] **4.5** `<ColorPicker.HueSlider>` (`src/components/hue-slider.tsx`)
  - Horizontal slider with rainbow gradient background
  - Draggable thumb via `usePointerDrag`
  - Updates hue in context
  - Keyboard support: left/right arrows
  - Configurable `orientation` (horizontal/vertical)

- [ ] **4.6** `<ColorPicker.AlphaSlider>` (`src/components/alpha-slider.tsx`)
  - Horizontal slider with checkerboard background + color overlay
  - Draggable thumb via `usePointerDrag`
  - Updates alpha in context
  - Keyboard support: left/right arrows

- [ ] **4.7** `<ColorPicker.Input>` (`src/components/input.tsx`)
  - Text input showing current color in selected format
  - Validates on blur / Enter key
  - Reverts to last valid value on invalid input
  - Optional inline format label (HEX, RGB, HSL)

- [ ] **4.8** `<ColorPicker.FormatToggle>` (`src/components/format-toggle.tsx`)
  - Cycles through HEX -> RGB -> HSL -> HEX
  - Button with current format label
  - Updates context format which changes Input display

- [ ] **4.9** `<ColorPicker.EyeDropper>` (`src/components/eye-dropper.tsx`)
  - Uses `window.EyeDropper` API
  - Renders nothing if API is unavailable (graceful degradation)
  - Shows pipette icon button
  - On pick, updates color in context
  - Loading state while picker is open

- [ ] **4.10** `<ColorPicker.Swatches>` (`src/components/swatches.tsx`)
  - Grid of preset color buttons
  - Accepts `colors: string[]` prop
  - Clicking a swatch updates color in context
  - Active swatch indicator (checkmark or ring)
  - Configurable columns

- [ ] **4.11** Component tests
  - Render tests for each component
  - Interaction tests: click area, drag slider, type input
  - Keyboard navigation tests
  - Disabled state tests

### Deliverables
- Fully functional solid color picker with all sub-components
- Accessible (keyboard + screen reader)
- Styled with Tailwind + CSS custom properties

### Estimated Effort: 8-10 hours

---

## Phase 5: Gradient Editor Components

**Goal**: Build the gradient editing layer on top of the solid picker.

### Tasks

- [ ] **5.1** `<ColorPicker.GradientEditor>` (`src/components/gradient-editor.tsx`)
  - Self-contained gradient editing UI
  - Gradient type selector (linear, radial, conic, mesh)
  - Angle input for linear/conic
  - Center point controls for radial
  - Integrates GradientPreview + GradientStops

- [ ] **5.2** `<GradientPreview>` (`src/components/gradient-preview.tsx`)
  - Renders gradient as CSS background
  - SVG overlay with draggable stop dots
  - For linear: stops along a line at the gradient angle
  - For radial: stops radiating from center
  - For conic: stops around a circle
  - For mesh: stops freely positioned in 2D
  - Click empty area to add new stop
  - Double-click stop to edit its color (opens nested picker)

- [ ] **5.3** `<GradientStops>` (`src/components/gradient-stops.tsx`)
  - Horizontal bar showing all stops
  - Draggable stop markers along the bar
  - Click to select, drag to reposition
  - Right-click or button to delete (minimum 2 stops enforced)
  - Active stop highlighted
  - Add stop on bar click at empty position

- [ ] **5.4** Nested color picker for gradient stops
  - When a gradient stop is selected, the main Area/HueSlider/AlphaSlider edit that stop's color
  - Context manages `activeStopId` to route color changes to the right stop
  - Smooth UX: selecting a stop loads its color into the pickers

- [ ] **5.5** Linear gradient support
  - Angle control (input + drag-to-rotate)
  - Stops positioned along the angle axis
  - CSS output: `linear-gradient(${angle}deg, ...stops)`

- [ ] **5.6** Radial gradient support
  - Center point control (drag in preview)
  - Stops radiating from center
  - CSS output: `radial-gradient(circle at ${cx}% ${cy}%, ...stops)`

- [ ] **5.7** Conic gradient support
  - Angle control for starting angle
  - Stops around circle in preview
  - CSS output: `conic-gradient(from ${angle}deg at ${cx}% ${cy}%, ...stops)`

- [ ] **5.8** Mesh gradient support
  - 2D free-form stop placement
  - Each stop is a radial gradient layer
  - CSS output: multiple layered `radial-gradient()` declarations
  - Add/remove/drag stops freely in 2D space

- [ ] **5.9** Gradient component tests
  - Preview rendering for each gradient type
  - Stop manipulation (add, remove, reorder, reposition)
  - Type switching preserves stops
  - CSS output validation

### Deliverables
- Full gradient editor for linear, radial, conic, and mesh gradients
- Smooth drag interactions for stop positioning
- Nested color editing per stop

### Estimated Effort: 10-12 hours

---

## Phase 6: Pre-composed Components & Public API

**Goal**: Create convenience components and finalize the public API.

### Tasks

- [ ] **6.1** `<ColorPickerPopover>` (`src/components/presets.tsx`)
  - Pre-composed popover with all standard controls
  - Props: `value`, `onValueChange`, `enableGradient`, `swatches`, `enableAlpha`, `enableEyeDropper`
  - Renders: Trigger + Content with Area, HueSlider, AlphaSlider, Input, FormatToggle, EyeDropper, Swatches, and optionally GradientEditor
  - Exported from `@markoradak/color-picker/presets`

- [ ] **6.2** `<ColorPickerInline>` (`src/components/presets.tsx`)
  - Same as popover but always visible (no trigger/popover wrapping)
  - Useful for embedding in forms or panels

- [ ] **6.3** Finalize `src/index.ts` exports
  - Named exports: `ColorPicker`, `ColorPickerPopover`, `ColorPickerInline`
  - Named exports: `toCSS`, `fromCSS`, `isGradient`, `isSolidColor`
  - Type exports: `ColorPickerValue`, `GradientValue`, `GradientStop`, `SolidColor`, `ColorFormat`
  - Sub-path export `@markoradak/color-picker/presets` for pre-composed components

- [ ] **6.4** Configure `package.json` exports map
  - `.` -> main library (compound components + utilities + types)
  - `./presets` -> pre-composed components
  - Ensure tree-shaking works correctly

- [ ] **6.5** CSS custom properties theme API
  - Document all CSS variables: `--cp-bg`, `--cp-border`, `--cp-radius`, `--cp-shadow`, etc.
  - Default light theme values
  - Dark mode values via `prefers-color-scheme`
  - Ensure all components use CSS vars, not hardcoded colors

### Deliverables
- Ready-to-use convenience components
- Clean, well-documented public API
- Tree-shakeable exports

### Estimated Effort: 3-4 hours

---

## Phase 7: Demo Site

**Goal**: Build a polished demo/docs site showcasing all features.

### Tasks

- [ ] **7.1** Landing page (`apps/web/app/page.tsx`)
  - Hero section with animated color picker demo
  - Feature highlights (compound API, gradients, a11y, tiny bundle)
  - Installation instructions
  - Basic usage examples with syntax highlighting

- [ ] **7.2** Playground page (`apps/web/app/playground/page.tsx`)
  - Live configurator with all options toggleable
  - Side-by-side: picker on left, generated code on right
  - Toggle: solid vs gradient mode
  - Toggle: popover vs inline
  - Customizable: swatches, format, alpha, eye dropper
  - Real-time CSS output display
  - Copy-to-clipboard for generated code

- [ ] **7.3** Dark mode support
  - System preference detection
  - Manual toggle
  - All demos work in both modes

- [ ] **7.4** Mobile responsive layout
  - Picker scales appropriately on small screens
  - Demo site is usable on mobile

### Deliverables
- Polished demo site deployable to Vercel
- Interactive playground for exploring all options

### Estimated Effort: 4-5 hours

---

## Phase 8: Testing, A11y & Polish

**Goal**: Production-ready quality, accessibility, and documentation.

### Tasks

- [ ] **8.1** Comprehensive unit tests
  - All utility functions (color, gradient, CSS, position)
  - All hooks (useColorPicker, useGradient, usePointerDrag)
  - Aim for >90% coverage on utils, >80% on hooks

- [ ] **8.2** Component integration tests
  - Full render of compound picker
  - Color selection flow (click area -> verify value change)
  - Gradient stop manipulation flow
  - Format switching flow
  - Keyboard navigation flow

- [ ] **8.3** Accessibility audit
  - All interactive elements have proper ARIA attributes
  - Keyboard navigable (Tab, Arrow keys, Enter, Escape)
  - Screen reader announcements for value changes
  - Focus management in popover (trap + restore)
  - Color contrast for UI elements themselves

- [ ] **8.4** Bundle size optimization
  - Verify tree-shaking works (import only what you use)
  - Check total bundle size (target: <15kB gzipped for core)
  - Ensure colord plugins are only imported when needed
  - No unnecessary re-renders (React.memo, useMemo, useCallback where needed)

- [ ] **8.5** Package README.md
  - Installation instructions
  - Quick start examples (solid picker, gradient picker, pre-composed)
  - API reference for all components and their props
  - Utility function documentation
  - CSS theming guide
  - Browser support (EyeDropper API availability note)

- [ ] **8.6** npm publish preparation
  - Verify `package.json` fields: name, version, description, keywords, license, repository, files
  - `prepublishOnly` script runs build
  - Test with `pnpm pack` to verify package contents
  - `.npmignore` or `files` field to exclude tests/docs

### Deliverables
- High test coverage
- WCAG 2.1 AA compliant
- Optimized bundle size
- Publish-ready package

### Estimated Effort: 5-6 hours

---

## Total Estimated Effort

| Phase | Description | Estimate |
|-------|-------------|----------|
| 1 | Foundation & Scaffolding | 1-2 hours |
| 2 | Core Types & Utilities | 3-4 hours |
| 3 | Hooks & State Management | 4-5 hours |
| 4 | Solid Color Components | 8-10 hours |
| 5 | Gradient Editor | 10-12 hours |
| 6 | Pre-composed & API | 3-4 hours |
| 7 | Demo Site | 4-5 hours |
| 8 | Testing & Polish | 5-6 hours |
| **Total** | | **38-48 hours** |

---

## Key Technical Risks

1. **HSV rounding during drag**: Internal state must stay in HSV during drag to avoid color drift through HEX rounding. Only convert on commit.
2. **Mesh gradient performance**: Layering many radial gradients can be slow. May need to limit stop count or use canvas fallback.
3. **Nested popover for gradient stops**: Radix Popover inside Radix Popover -- need to verify this works without z-index/portal conflicts.
4. **EyeDropper API support**: Only Chromium browsers. Must gracefully hide on Firefox/Safari.
5. **Tailwind v4 compatibility**: v4 is CSS-first config. Ensure it works in a library consumed by apps with their own Tailwind setup.

## Dependencies Summary

| Package | Purpose | Size |
|---------|---------|------|
| colord | Color parsing/conversion | ~1.7kB |
| @radix-ui/react-popover | Popover positioning + a11y | ~8kB |
| react (peer) | UI framework | -- |
| react-dom (peer) | DOM rendering | -- |
| tailwindcss (peer) | Styling | -- |
| tsup (dev) | Build ESM + CJS | -- |
| vitest (dev) | Unit testing | -- |
| @testing-library/react (dev) | Component testing | -- |
| turbo (dev, root) | Monorepo task runner | -- |
