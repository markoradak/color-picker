# @markoradak/color-picker

<!-- auto-start: overview -->
A production-ready compound-component React color picker and gradient editor library (`@markoradak/color-picker`), built as a pnpm monorepo with Turborepo orchestration. The library provides a Radix-style composable API for solid color selection (HEX/RGB/HSL) and gradient editing (linear, radial, conic, mesh). All 8 implementation phases are complete with 234 tests passing, full accessibility support, forwardRef on all components, and CSS custom properties theming.
<!-- auto-end: overview -->

## Quick Reference

<!-- auto-start: quick-reference -->
| | |
|---|---|
| **Language** | TypeScript 5.9 |
| **Framework** | React 19 (library), Next.js 15 (demo site) |
| **Package Manager** | pnpm 10.18 |
| **Node Version** | >= 18.0.0 |
| **Monorepo** | Turborepo 2.8 |

**Key Commands** (run from repo root):
```
pnpm dev            # Start library watch + Next.js dev server (Turbopack)
pnpm build          # Build library (tsup + tsc) then web app
pnpm test           # Run vitest in packages/react
pnpm lint           # Lint all packages
pnpm typecheck      # Type-check all packages
pnpm clean          # Remove dist/ and .next/ outputs
```

**Library-specific** (run from `packages/react/`):
```
pnpm build          # tsup (JS bundles) + tsc --emitDeclarationOnly (declarations)
pnpm dev            # tsup --watch
pnpm test           # vitest run
pnpm test:watch     # vitest (watch mode)
pnpm typecheck      # tsc --noEmit
```
<!-- auto-end: quick-reference -->

## Project Structure

<!-- auto-start: structure -->
```
color-picker/
  apps/
    web/                    # Next.js 15 demo/docs site (App Router, Turbopack)
      app/
        layout.tsx          # Root layout with ThemeProvider
        page.tsx            # Landing page with hero demo
        playground/
          page.tsx          # Playground server page
          playground-client.tsx  # Live configurator
        hero-demo.tsx       # Animated color picker demo
        theme-provider.tsx  # Dark mode context
        theme-toggle.tsx    # Dark mode toggle button
        component-styles.ts # Shared component style constants
        code-block.tsx      # Syntax-highlighted code display
        copy-button.tsx     # Copy-to-clipboard button
      components/           # Additional shared web components
      public/               # Static assets
  packages/
    react/                  # Published library: @markoradak/color-picker
      src/
        components/         # Compound components (ColorPicker.*, presets)
          shared.ts         # Shared style constants (checkerboard pattern)
          presets.tsx        # Pre-composed ColorPickerPopover, ColorPickerInline
          color-picker.tsx  # Root provider + context
          color-picker-context.ts  # Context definition
          color-picker-provider.tsx  # Context-only provider (no Popover.Root)
          token-list.tsx    # Shared token list dropdown component
          input-trigger.tsx # Input-style trigger with inline controls
          *.test.tsx        # Component integration tests
        hooks/              # useColorPicker, useGradient, usePointerDrag, useTokenDropdown, useAutoTokens
        utils/              # Color math, gradient ops, CSS conversion, position
          *.test.ts         # Utility unit tests
        types.ts            # All public TypeScript types
        styles.css          # CSS custom properties theme API (light + dark)
        index.ts            # Barrel exports
        test-setup.ts       # Vitest setup (@testing-library/jest-dom)
      dist/                 # Build output (ESM + CJS + .d.ts + styles.css)
      tsup.config.ts        # Dual-entry: index + presets
      vitest.config.ts      # jsdom, globals, @/ alias
  tasks/
    plans/                  # Implementation plan files
  turbo.json                # Turborepo pipeline config
  pnpm-workspace.yaml       # Workspace: packages/*, apps/*
```

**Key Paths**:
- `packages/react/src/components/` -- Compound component files (color-picker, area, sliders, input, input-trigger, trigger, content, swatches, gradient-*, token-list, presets)
- `packages/react/src/hooks/` -- State management hooks (use-color-picker, use-gradient, use-pointer-drag, use-token-dropdown, use-auto-tokens)
- `packages/react/src/utils/` -- Pure utility functions (color.ts, gradient.ts, css.ts, position.ts)
- `packages/react/src/types.ts` -- All shared TypeScript types (ColorPickerValue, GradientValue, GradientType, HSVA, prop interfaces)
- `packages/react/src/styles.css` -- CSS custom properties theme with light/dark defaults
- `apps/web/` -- Next.js demo site consuming the library via `workspace:*`
<!-- auto-end: structure -->

## Tech Stack

<!-- auto-start: tech-stack -->
**Core**:
- React 19 (peer dependency, library supports >= 18)
- TypeScript 5.9 (strict mode, `noUncheckedIndexedAccess`)
- Next.js 15.2 with Turbopack (demo site only)

**Build**:
- tsup 8.4 -- dual-entry bundler (`index` + `presets`), ESM (`.js`) + CJS (`.cjs`), tree-shakeable, code-split, sourcemaps
- tsc -- generates `.d.ts` declaration files (run separately after tsup)
- Turborepo 2.8 -- orchestrates build/dev/test across workspaces

**Styling**: Tailwind CSS v4 (demo site), CSS custom properties theme API (`styles.css` shipped with library)

**Testing**: Vitest 3.0 + @testing-library/react 16.3 + jsdom (234 tests)

**Key Dependencies**:
- `colord` -- Color parsing, conversion, and manipulation (~1.7kB, with `names` + `a11y` plugins)
- `@radix-ui/react-popover` -- Accessible popover positioning for trigger/content pattern
- `@testing-library/jest-dom` -- Custom matchers for DOM assertions in tests
<!-- auto-end: tech-stack -->

## Patterns & Conventions

<!-- auto-start: patterns -->
**Naming**:
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` (e.g., `ColorPicker`, `GradientEditor`)
- Hooks: `camelCase` with `use` prefix (e.g., `useColorPicker`, `usePointerDrag`)
- Utilities: `camelCase` (e.g., `formatColor`, `createGradientStop`)
- Types/Interfaces: `PascalCase` (e.g., `ColorPickerValue`, `HSVA`, `GradientType`)

**Imports**:
- Path alias `@/*` maps to `packages/react/src/*` (configured in tsconfig + vitest)
- Relative imports within the library (e.g., `../utils/color`, `../types`)
- No barrel exports in subdirectories -- `src/index.ts` is the sole barrel

**Component Architecture**:
- **Compound component pattern** -- `ColorPicker` is the root provider, sub-components (Area, HueSlider, Input, etc.) consume context
- Context via `createContext` + `useContext` with a `useColorPickerContext()` hook that throws if used outside provider
- **All components support `forwardRef`** -- Area, HueSlider, AlphaSlider, Input, Trigger, Content, FormatToggle, EyeDropper, Swatches, ModeSelector, GradientEditor (11 components)
- Function components only, no class components
- Props defined as `interface` (not `type`)
- JSDoc comments on all public exports

**State Management**:
- Internal HSVA state for smooth drag interactions (avoids HEX rounding during pointer movement)
- Controlled/uncontrolled pattern (`value` + `onValueChange` + `defaultValue`)
- `useRef` for synchronizing controlled value changes without re-render loops
- `useTokenDropdown` hook -- shared state machine for token dropdown open/close, search, keyboard navigation, and click-outside dismissal (used by both `ColorPickerInput` and `ColorPickerInputTrigger`)
- `useAutoTokens` hook -- merges auto-detected CSS custom property color tokens with manually provided tokens, deferred to post-mount for SSR safety

**Value System**:
- `ColorPickerValue = SolidColor | GradientValue` -- structured types, not raw CSS strings
- `GradientType = "linear" | "radial" | "conic" | "mesh"` -- shared gradient type union
- Utility functions `toCSS()` / `fromCSS()` for converting to/from CSS strings
- `fromCSS()` fully parses CSS gradient strings (`linear-gradient`, `radial-gradient`, `conic-gradient`) into structured `GradientValue` objects with proper stop positions, angles, and center coordinates
- `sanitizeColor()` exported from `utils/css.ts` -- returns `"transparent"` for invalid color strings
- Type guards `isGradient()` / `isSolidColor()` for narrowing

**Library Exports**:
- Main entry: `@markoradak/color-picker` -- compound components, hooks, utilities, types
- Sub-path: `@markoradak/color-picker/presets` -- pre-composed convenience components
- Sub-path: `@markoradak/color-picker/styles` or `./styles.css` -- CSS custom properties theme
- Dual format: ESM (`.js`) + CJS (`.cjs`) with `.d.ts` declarations
- `sideEffects: ["*.css"]` -- only CSS files have side effects, rest is tree-shakeable
- Exported prop types include: `ColorPickerFormatToggleProps`, `ColorPickerEyeDropperProps`, `ColorPickerGradientEditorProps`, `GradientPreviewProps`, `GradientStopsProps`, `ColorPickerControlsProps`, `ColorPickerInputTriggerProps`, `ColorPickerProviderProps`, `TokenListProps`

**CSS Custom Properties Theme**:
- All styling driven by `--cp-*` custom properties for easy theming
- Key properties: `--cp-bg`, `--cp-border`, `--cp-radius`, `--cp-text`, `--cp-shadow`, `--cp-width`, etc.
- Additional properties: `--cp-checkerboard-color`, `--cp-z-index-dropdown`, `--cp-z-index-portal`, `--cp-font-family`, `--cp-transition-duration`
- Automatic dark mode via `prefers-color-scheme: dark` and `.dark` class override
- Components targeted via `data-cp-part` and `data-cp-el` attribute selectors
- Animations: `cp-spin` (eye dropper loading), `cp-token-list-in` (dropdown entrance)
- Respects `prefers-reduced-motion: reduce`

**Testing**:
- Test files co-located with source: `*.test.ts` / `*.test.tsx` next to source files
- Vitest with jsdom environment and global test APIs
- `@testing-library/jest-dom/vitest` setup for DOM matchers
- 234 tests across utils (color, gradient, css, position), hooks (use-auto-tokens), and components (color-picker, color-picker-provider, gradient-editor, mode-selector)

**Audit Fixes Applied**:
- Stale HSVA closure fix in useColorPicker (ref-based sync)
- Missing effect dependency in useColorPicker
- `stopIdCounter` SSR safety (module-scoped counter)
- `usePointerDrag` cleanup (proper event listener removal)
- `sanitizeColor` guard in `toCSS` for malformed color strings
- Mesh gradient zero-alpha blending to prevent black-fringing artifacts
<!-- auto-end: patterns -->

## Development Workflow

<!-- auto-start: workflow -->
**Build Pipeline**:
- Turborepo ensures `packages/react` builds before `apps/web` (via `dependsOn: ["^build"]`)
- Library build: `tsup` (JS bundles) then `tsc --emitDeclarationOnly` (declarations) then `cp src/styles.css dist/styles.css`
- Tests depend on `^build` completing first

**Dev Mode**:
- `pnpm dev` runs `tsup --watch` in the library and `next dev --turbopack` in the web app concurrently
- Changes to library source are picked up automatically by the demo site

**Package Publishing**:
- `prepublishOnly` script runs build automatically
- `files` field limits published contents to `dist/` and `README.md`
- Package includes `exports` map with conditional `import`/`require` entries for `.`, `./presets`, `./styles`, `./styles.css`

**Commit Convention**: Conventional commits (`feat:`, `fix:`, `test:`, `chore:`, `perf:`, `refactor:`) with optional scope (e.g., `feat(react):`)

**Branch Strategy**: Feature branches off `feat/color-picker` (main development branch)
<!-- auto-end: workflow -->

## Notes

<!-- This section is for manually-added notes. It will not be overwritten by auto-generation. -->
