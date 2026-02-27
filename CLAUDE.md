# @markoradak/color-picker

<!-- auto-start: overview -->
A compound-component React color picker and gradient editor library (`@markoradak/color-picker`), built as a pnpm monorepo with Turborepo orchestration. The library provides a Radix-style composable API for solid color selection (HEX/RGB/HSL) and gradient editing (linear, radial, conic, mesh).
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
        layout.tsx
        page.tsx
        playground/page.tsx
  packages/
    react/                  # Published library: @markoradak/color-picker
      src/
        components/         # Compound components (ColorPicker.*, presets)
        hooks/              # useColorPicker, useGradient, usePointerDrag
        utils/              # Color math, gradient ops, CSS conversion, position
        types.ts            # All public TypeScript types
        index.ts            # Barrel exports
      dist/                 # Build output (ESM + CJS + .d.ts)
      tsup.config.ts
      vitest.config.ts
  tasks/
    plans/                  # Implementation plan files
  turbo.json                # Turborepo pipeline config
  pnpm-workspace.yaml       # Workspace: packages/*, apps/*
```

**Key Paths**:
- `packages/react/src/components/` -- Compound component files (color-picker, area, sliders, input, trigger, content, swatches, gradient-*)
- `packages/react/src/hooks/` -- State management hooks (use-color-picker, use-gradient, use-pointer-drag)
- `packages/react/src/utils/` -- Pure utility functions (color.ts, gradient.ts, css.ts, position.ts)
- `packages/react/src/types.ts` -- All shared TypeScript types (ColorPickerValue, GradientValue, HSVA, prop interfaces)
- `apps/web/` -- Next.js demo site consuming the library via `workspace:*`
<!-- auto-end: structure -->

## Tech Stack

<!-- auto-start: tech-stack -->
**Core**:
- React 19 (peer dependency, library supports >= 18)
- TypeScript 5.9 (strict mode, `noUncheckedIndexedAccess`)
- Next.js 15.2 with Turbopack (demo site only)

**Build**:
- tsup 8.4 -- bundles library to ESM (`.js`) + CJS (`.cjs`), tree-shakeable, code-split
- tsc -- generates `.d.ts` declaration files (run separately after tsup)
- Turborepo 2.8 -- orchestrates build/dev/test across workspaces

**Styling**: Tailwind CSS v4 (demo site), CSS custom properties (library theming)

**Testing**: Vitest 3.0 + @testing-library/react 16.3 + jsdom

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
- Types/Interfaces: `PascalCase` (e.g., `ColorPickerValue`, `HSVA`)

**Imports**:
- Path alias `@/*` maps to `packages/react/src/*` (configured in tsconfig + vitest)
- Relative imports within the library (e.g., `../utils/color`, `../types`)
- No barrel exports in subdirectories -- `src/index.ts` is the sole barrel

**Component Architecture**:
- **Compound component pattern** -- `ColorPicker` is the root provider, sub-components (Area, HueSlider, Input, etc.) consume context
- Context via `createContext` + `useContext` with a `useColorPickerContext()` hook that throws if used outside provider
- Function components only, no class components
- Props defined as `interface` (not `type`)
- JSDoc comments on all public exports

**State Management**:
- Internal HSVA state for smooth drag interactions (avoids HEX rounding during pointer movement)
- Controlled/uncontrolled pattern (`value` + `onValueChange` + `defaultValue`)
- `useRef` for synchronizing controlled value changes without re-render loops

**Value System**:
- `ColorPickerValue = SolidColor | GradientValue` -- structured types, not raw CSS strings
- Utility functions `toCSS()` / `fromCSS()` for converting to/from CSS strings
- Type guards `isGradient()` / `isSolidColor()` for narrowing

**Library Exports**:
- Main entry: `@markoradak/color-picker` -- compound components, hooks, utilities, types
- Sub-path: `@markoradak/color-picker/presets` -- pre-composed convenience components
- Dual format: ESM (`.js`) + CJS (`.cjs`) with `.d.ts` declarations
- `sideEffects: false` for tree-shaking

**Testing**:
- Test files co-located with source: `*.test.ts` next to `*.ts`
- Vitest with jsdom environment and global test APIs
- `@testing-library/jest-dom/vitest` setup for DOM matchers
<!-- auto-end: patterns -->

## Development Workflow

<!-- auto-start: workflow -->
**Build Pipeline**:
- Turborepo ensures `packages/react` builds before `apps/web` (via `dependsOn: ["^build"]`)
- Library build: `tsup` (JS bundles) then `tsc --emitDeclarationOnly` (declarations)
- Tests depend on `^build` completing first

**Dev Mode**:
- `pnpm dev` runs `tsup --watch` in the library and `next dev --turbopack` in the web app concurrently
- Changes to library source are picked up automatically by the demo site

**Package Publishing**:
- `prepublishOnly` script runs build automatically
- `files` field limits published contents to `dist/` and `README.md`
- Package includes `exports` map with conditional `import`/`require` entries
<!-- auto-end: workflow -->

## Notes

<!-- This section is for manually-added notes. It will not be overwritten by auto-generation. -->
