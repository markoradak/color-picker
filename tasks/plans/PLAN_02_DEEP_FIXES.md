# Plan: DEEP_FIXES

**Created**: 2026-03-07T00:00:00Z
**Status**: Ready

Deep analysis of the @markoradak/color-picker library identified 39 issues across components, hooks, utils, types, build config, and test coverage. This plan addresses critical bugs (Concurrent Mode safety, stale closures), performance regressions (context re-render cascades during drag), API completeness gaps (missing HTML prop spreading, missing forwardRef on 14 components), type safety improvements (discriminated union for GradientValue), accessibility gaps, CSS parsing robustness, build/packaging fixes, and comprehensive test coverage for all hooks and untested components.

---

## Objective

### Problem Statement

The library has shipped 8 complete implementation phases with 234 tests passing, but a deep code audit revealed issues at multiple severity levels: render-phase state mutations that break React Concurrent Mode, stale closure bugs in input validation, performance regressions from unstable callback references during drag operations, 14 components missing forwardRef, an overly permissive GradientValue type that allows invalid field combinations, accessibility gaps in gradient controls, and insufficient test coverage for hooks and pointer interactions.

### Success Criteria

- [ ] All 3 critical bugs fixed (render-phase mutations, stale closure, ref fragility)
- [ ] Context re-render cascade eliminated during drag interactions
- [ ] All exported components support HTML prop spreading and forwardRef
- [ ] GradientValue converted to discriminated union with per-type required fields
- [ ] All 5 accessibility gaps closed (aria-orientation, aria-expanded, keyboard access)
- [ ] CSS parsing handles two-position stops and repeating gradients
- [ ] Package ready for npm publish (LICENSE, publishConfig, exports map fix)
- [ ] Hook test coverage: useColorPicker, useGradient, usePointerDrag, useTokenDropdown
- [ ] Component test coverage: TokenList, keyboard interactions, pointer drag patterns
- [ ] All existing 234 tests continue to pass
- [ ] `pnpm build`, `pnpm typecheck`, and `pnpm test` pass cleanly after each phase

---

## Background & Context

### Current State

The library is feature-complete with 234 passing tests, full accessibility support, forwardRef on the 11 primary components, CSS custom properties theming, and a working demo site. Two previous plan cycles (PLAN_00_INITIAL with 50 tasks and PLAN_01_FIXES with 37 tasks) built and polished the library. The codebase is on the `feat-restyle` branch off `feat/color-picker`.

### Why This Matters

- **Concurrent Mode bugs** will cause unpredictable behavior when React 19's concurrent features are used (the library declares `react >= 18` as a peer dependency)
- **Stale closure in commitValue** means token-based color validation can silently fail after auto-detection completes
- **Context re-render cascade** causes every gradient sub-component to re-render on every drag frame, impacting 60fps performance
- **Missing HTML prop spreading** blocks consumers from adding `data-testid`, `aria-*`, event handlers, or `style` overrides on most components
- **Permissive GradientValue type** allows constructing invalid gradients (e.g., a `"linear"` gradient with `centerX` but no `angle`) and requires defensive `?? fallback` chains everywhere
- **Missing LICENSE file** makes the package legally ambiguous despite `"license": "MIT"` in package.json
- **Nested types in exports map** breaks TypeScript module resolution in some bundler configurations

### Key Findings from Discussion

- `setHSVA()` is called during the render body of `useColorPicker` (L53-63) when `controlledValue` changes -- this is a state mutation during render that breaks Concurrent Mode where renders can be discarded
- `useGradient` has the same pattern at L37-43 with `setActiveStopId` during render
- `commitValue` in both `input.tsx` (L50-60) and `input-trigger.tsx` (L82-91) closes over `tokens` but omits it from the useCallback dependency array
- `isInternalUpdateRef` is a positional boolean flag that can be consumed by the wrong comparison if the parent sets a new value in the same React flush
- Every `useCallback` in `useGradient` lists `gradient` in deps, but `gradient` changes identity on every render, causing all callbacks to get new references and triggering full context consumer re-renders
- `useColorPicker` returns a new object literal every render, which cascades through `contextValue` useMemo
- 14 sub-components lack `forwardRef`: AreaGradient, AreaThumb, HueSliderTrack, HueSliderThumb, AlphaSliderTrack, AlphaSliderThumb, Swatch, GradientSwatch, ModeSelectorItem, InputTrigger, ColorPickerProvider, GradientPreview, GradientStops, TokenList
- `GradientValue` is a single flat interface where `angle`, `centerX`, `centerY`, `baseColor`, `startPoint`, `endPoint` are all optional regardless of gradient type
- `startPoint`/`endPoint` on GradientValue are internal UI state that leaks into serialized data
- `orientation` prop on `ColorPickerSliderProps` is declared but never implemented
- No `aria-orientation` on slider elements
- No keyboard access to gradient context menu (right-click only)
- `parseSingleStop` does not handle CSS two-position stop syntax (`red 20% 40%`)
- `fromCSS` does not handle `repeating-*-gradient` functions
- `getRelativePosition` guards both axes when either is zero, losing the valid axis
- `updateStop` does not sort after position change (inconsistent with `addStop`)
- `stopIdCounter` is module-level mutable state that contaminates across tests
- `requestAnimationFrame` in `closeTokenDropdown` is never cancelled on unmount
- Package exports map nests `types` inside `import`/`require` instead of top-level
- No LICENSE file in the package or repo root
- No `publishConfig` in package.json
- `^build` dependency on test task is unnecessary (Vitest transforms TS directly)
- Dark mode CSS variables are duplicated between `@media (prefers-color-scheme: dark)` and `.dark` class
- No `@layer` wrapping for Tailwind v4 specificity interop
- Internal utilities (`clamp`, `getRelativePosition`, `angleFromPosition`, `usePointerDrag`) are exported from the barrel

---

## Proposed Approach

### High-Level Strategy

Fix issues in 8 phases ordered by severity and dependency: critical bugs first (Phase 1), then performance (Phase 2), then API surface improvements (Phases 3-4), accessibility (Phase 5), utils/parsing (Phase 6), build/config (Phase 7), and comprehensive tests last (Phase 8) to validate everything.

Each phase is self-contained and testable. After each phase, run `pnpm test`, `pnpm typecheck`, and `pnpm build` to verify no regressions.

### Key Technical Decisions

1. **Move render-phase state mutations into useEffect**
   - Rationale: React Concurrent Mode can discard and replay renders; state mutations and ref updates during render can leave inconsistent state
   - Trade-offs: Adds one extra render cycle for controlled value sync (imperceptible in practice)

2. **Replace boolean isInternalUpdateRef with expectedNextValueRef**
   - Rationale: A boolean flag has no identity -- it can be consumed by the wrong comparison if the parent sets a different value in the same flush. Storing the expected value string provides a precise identity check.
   - Trade-offs: Slightly more memory (one string ref vs one boolean ref), but eliminates an entire class of sync bugs

3. **Use gradientRef pattern to stabilize useGradient callbacks**
   - Rationale: `gradient` changes identity on every parent render, causing all useCallback dependency arrays to invalidate, which cascades new context value references to all consumers
   - Trade-offs: Reading from a ref inside callbacks means the callbacks capture a mutable reference rather than a stable snapshot; this is safe because the callbacks are only called in response to user interactions, not during render

4. **Convert GradientValue to discriminated union**
   - Rationale: The current flat interface allows invalid combinations (e.g., linear gradient with centerX) and requires defensive `?? fallback` chains throughout the codebase
   - Trade-offs: This is a BREAKING CHANGE to the type API; consumers who construct GradientValue objects will need to provide the correct fields per type. However, since the library is pre-1.0, this is the right time.

### Alternative Approaches Considered

- **Keep GradientValue as flat interface**: Simpler, non-breaking, but every consumer and internal function needs to defensively handle all optional fields. Rejected because the type system should encode the invariants.
- **Use React.memo on all context consumers instead of stabilizing callbacks**: Would reduce re-renders but is more fragile and puts the burden on consumers. Rejected because stabilizing the source is cleaner.
- **Skip startPoint/endPoint extraction**: Could leave them on GradientValue and just ignore them in serialization. Rejected because internal UI state should not leak into user-facing data structures.

---

## Implementation Plan

### Phase 1: Critical Bugs

**Goal**: Fix 3 bugs that cause incorrect behavior under React Concurrent Mode and stale closure validation failures.

**Tasks**:
1. [ ] **Fix render-phase state mutations in useColorPicker and useGradient**
   - File(s): `packages/react/src/hooks/use-color-picker.ts` (L53-63), `packages/react/src/hooks/use-gradient.ts` (L37-43)
   - Details:
     - In `use-color-picker.ts`: Move the `if (controlledValue !== prevControlledRef.current)` block (L53-63) into a `useEffect(() => { ... }, [controlledValue, tokens])`. Guard with `isInternalUpdateRef` inside the effect. Remove the render-phase `prevControlledRef` comparison.
     - In `use-gradient.ts`: Move the `if (value !== prevValueRef.current)` block (L37-43) into a `useEffect(() => { ... }, [value])`. Use a ref to track the previous value for comparison inside the effect.
   - Estimated effort: Medium

2. [ ] **Fix stale `tokens` closure in `commitValue`**
   - File(s): `packages/react/src/components/input.tsx` (L50-60), `packages/react/src/components/input-trigger.tsx` (L82-91)
   - Details:
     - In `input.tsx` L60: Change `[inputValue, formattedValue, setColorFromString]` to `[inputValue, formattedValue, setColorFromString, tokens]`
     - In `input-trigger.tsx` L91: Change `[inputValue, formattedValue, setColorFromString]` to `[inputValue, formattedValue, setColorFromString, tokens]`
   - Estimated effort: Small

3. [ ] **Fix `isInternalUpdateRef` fragility in useColorPicker**
   - File(s): `packages/react/src/hooks/use-color-picker.ts`
   - Details:
     - Replace `const isInternalUpdateRef = useRef(false)` with `const expectedNextValueRef = useRef<string | null>(null)`
     - In `updateValue`: set `expectedNextValueRef.current = typeof newValue === 'string' ? newValue : JSON.stringify(newValue)` (or a stable serialization)
     - In the sync effect: check if `controlledValue === expectedNextValueRef.current` (or deep-equal for gradients) to skip sync, then reset to `null`
     - This eliminates the positional boolean that can be consumed by the wrong comparison
   - Estimated effort: Medium

**Validation**:
- [ ] `pnpm test` passes in packages/react
- [ ] `pnpm typecheck` passes
- [ ] Manual test: Controlled value prop changes correctly sync HSVA
- [ ] Manual test: Token-based input validation works after auto-detection completes

### Phase 2: Performance

**Goal**: Eliminate unnecessary context re-renders during drag interactions by stabilizing callback references.

**Tasks**:
4. [ ] **Fix context re-render cascade during drag**
   - File(s): `packages/react/src/hooks/use-gradient.ts`
   - Details:
     - Add `const gradientRef = useRef(gradient); gradientRef.current = gradient;` after line 29
     - Remove `gradient` from all `useCallback` dependency arrays (handleAddStop L64, handleAddStopWithCoordinates L79, handleRemoveStop L91, updateStopColor L99, updateStopPosition L107, updateStopCoordinates L115, setGradientType L122, setAngle L129, setCenter L136, setBaseColor L143, handleMoveStop L151)
     - Inside each callback, read `gradientRef.current` instead of the closed-over `gradient`
     - Keep only `update` (and `activeStopId` where used) in dep arrays
   - Estimated effort: Medium

5. [ ] **Memoize useColorPicker return values**
   - File(s): `packages/react/src/hooks/use-color-picker.ts` (L172-189)
   - Details:
     - Wrap the return object in `useMemo` with proper dependency array, OR
     - Restructure to spread individual values into the context provider directly
     - The current return of a plain object literal means `contextValue` useMemo in `color-picker.tsx` breaks every render since `pickerState` is a dep
     - Verify that all values in the return are either primitives, memoized, or stable refs
   - Estimated effort: Medium

**Validation**:
- [ ] `pnpm test` passes
- [ ] React DevTools Profiler shows no unnecessary re-renders of Area/Sliders during gradient stop drag
- [ ] Drag interactions remain smooth at 60fps

### Phase 3: API Completeness

**Goal**: Make all components fully composable by supporting HTML prop spreading, missing forwardRef, event handler composition, and removing dead props.

**Tasks**:
6. [ ] **Add HTML props spreading to all components**
   - File(s): Multiple component files in `packages/react/src/components/` and `packages/react/src/types.ts`
   - Affected components: Area, HueSlider, AlphaSlider, FormatToggle, EyeDropper, Swatches, ModeSelector, GradientEditor, Input, Swatch, GradientSwatch, ModeSelectorItem
   - Details:
     - For each component, extend the props interface to include native HTML attributes: e.g., `interface ColorPickerFormatToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`
     - Destructure known props, collect rest: `const { className, children, ...rest } = props`
     - Spread `{...rest}` on the primary DOM element (NOT on Radix components)
     - For event handlers (onClick, onBlur, etc.), compose with internal handlers so both fire
   - Estimated effort: Large

7. [ ] **Add forwardRef to 14 exported components**
   - File(s): `packages/react/src/components/area.tsx` (ColorPickerAreaGradient, ColorPickerAreaThumb), `hue-slider.tsx` (Track, Thumb), `alpha-slider.tsx` (Track, Thumb), `swatches.tsx` (ColorPickerSwatch), `gradient-swatches.tsx` (ColorPickerGradientSwatch), `mode-selector.tsx` (ColorPickerModeSelectorItem), `input-trigger.tsx` (ColorPickerInputTrigger), `color-picker-provider.tsx` (ColorPickerProvider), `gradient-preview.tsx` (GradientPreview), `gradient-stops.tsx` (GradientStops), `token-list.tsx` (TokenList)
   - Details:
     - Wrap each with `forwardRef`, add ref parameter, forward to primary DOM element
     - Update displayName for React DevTools
   - Estimated effort: Large

8. [ ] **Remove dead `orientation` prop from types**
   - File(s): `packages/react/src/types.ts` (L123)
   - Details:
     - Remove `orientation?: "horizontal" | "vertical"` from `ColorPickerSliderProps`
     - Verify no code references it (it is currently ignored in both slider components)
     - Implementing vertical mode would require drag axis changes, CSS layout changes, and aria-orientation -- better to add as a proper feature later
   - Estimated effort: Small

9. [ ] **Add event handler composition utility**
   - File(s): Create helper (inline or shared) in component files
   - Details:
     - Add a `composeEventHandlers` utility:
       ```ts
       function composeEventHandlers<E>(internal: (e: E) => void, external?: (e: E) => void) {
         return (e: E) => { internal(e); external?.(e); };
       }
       ```
     - Apply to: Swatch onClick, GradientSwatch onClick, ModeSelectorItem onClick, Input onBlur
     - This is partially handled by Task 6 (HTML props spreading), but these specific handlers need explicit composition since they have internal logic
   - Estimated effort: Medium

**Validation**:
- [ ] `pnpm typecheck` passes (interface extensions compile)
- [ ] `pnpm test` passes
- [ ] Consumers can pass `data-testid`, `aria-*`, `style`, `onClick` etc. to all components
- [ ] All 25 exported components support `ref` forwarding

### Phase 4: Type Safety

**Goal**: Convert GradientValue to a discriminated union, separate mesh stops, extract internal UI state, and DRY up token class names.

**Tasks**:
10. [x] **Convert GradientValue to discriminated union**
    - File(s): `packages/react/src/types.ts`, and all files that create/read GradientValue
    - Details:
      - Define discriminated union:
        ```ts
        interface BaseGradientValue { stops: GradientStop[]; }
        interface LinearGradientValue extends BaseGradientValue { type: "linear"; angle: number; }
        interface RadialGradientValue extends BaseGradientValue { type: "radial"; centerX: number; centerY: number; }
        interface ConicGradientValue extends BaseGradientValue { type: "conic"; angle: number; centerX: number; centerY: number; }
        interface MeshGradientValue { type: "mesh"; stops: MeshGradientStop[]; baseColor?: string; }
        type GradientValue = LinearGradientValue | RadialGradientValue | ConicGradientValue | MeshGradientValue;
        ```
      - Update all code that creates/reads GradientValue: `toCSS`, `fromCSS`, `useGradient`, `gradient.ts` utils, `mode-selector`, `gradient-preview`, `gradient-stops`, `gradient-editor`, `presets`
      - Remove `?? fallback` chains where TypeScript now guarantees the field exists
    - Estimated effort: Large

11. [x] **Create separate MeshGradientStop type**
    - File(s): `packages/react/src/types.ts`
    - Details:
      - Define `interface MeshGradientStop { id: string; color: string; position: number; x: number; y: number; }`
      - Update MeshGradientValue to use `stops: MeshGradientStop[]`
      - Remove `x?: number; y?: number` from the base GradientStop
      - Update `toCSS` mesh handling to remove `?? 50` fallbacks (now required)
      - Update `gradient-preview.tsx` mesh rendering
    - Estimated effort: Medium

12. [x] **Move startPoint/endPoint out of GradientValue** (kept in type with @internal JSDoc per plan)
    - File(s): `packages/react/src/types.ts`, `packages/react/src/hooks/use-gradient.ts`, `packages/react/src/components/gradient-preview.tsx`
    - Details:
      - Create internal type: `interface GradientUIState { startPoint?: {x:number,y:number}; endPoint?: {x:number,y:number}; }`
      - Move into `useGradient` hook state (separate `useState`)
      - Remove `startPoint` and `endPoint` from the GradientValue type
      - Update `gradient-preview.tsx` to read from hook state instead of the value
      - Update `useGradient`'s `setAngle`/`setCenter` to clear the UI state
      - This prevents internal UI state from leaking into serialized/stored data
    - Estimated effort: Medium

13. [x] **Extract shared TokenListClassNames interface**
    - File(s): `packages/react/src/types.ts`
    - Details:
      - Currently `ColorPickerInputProps.classNames` and `ColorPickerInputTriggerProps.classNames` duplicate token-related class name fields (tokenBadge, tokenIcon, tokenSearch, tokenSearchInput, tokenSearchIcon, tokenListContainer, tokenList, tokenListItem, tokenListSwatch, tokenListName, tokenListCheck, tokenListEmpty)
      - Extract into a shared `TokenListClassNames` interface
      - Have both interfaces reference it via intersection
    - Estimated effort: Small

**Validation**:
- [ ] `pnpm typecheck` passes with stricter types
- [ ] `pnpm test` passes
- [ ] `pnpm build` produces valid output
- [ ] TypeScript errors surface when constructing a linear gradient without `angle`
- [ ] `startPoint`/`endPoint` no longer appear in `onValueChange` callback data

### Phase 5: Accessibility

**Goal**: Close 5 accessibility gaps in slider ARIA attributes, gradient stop popover state, keyboard access to context menu, keyboard gradient stop creation, and input trigger labeling.

**Tasks**:
14. [x] **Add aria-orientation to slider elements**
    - File(s): `packages/react/src/components/area.tsx`, `packages/react/src/components/hue-slider.tsx`, `packages/react/src/components/alpha-slider.tsx`
    - Details:
      - Area: already has `role="slider"` at L140; add `aria-orientation="horizontal"` (2D, but horizontal is the default and most appropriate)
      - HueSlider: add `aria-orientation="horizontal"` to the `role="slider"` div
      - AlphaSlider: add `aria-orientation="horizontal"` to the `role="slider"` div
    - Estimated effort: Small

15. [x] **Add aria-expanded to gradient stop triggers**
    - File(s): `packages/react/src/components/gradient-preview.tsx`, `packages/react/src/components/gradient-stops.tsx`
    - Details:
      - In gradient-preview.tsx: Stop dot buttons that act as `Popover.Trigger` -- add `aria-expanded={isOpen}` where `isOpen` tracks whether that stop's popover is open. Add `aria-controls` linking to the popover content ID.
      - In gradient-stops.tsx: Same pattern for stop markers
    - Estimated effort: Small

16. [x] **Add keyboard access to gradient context menu**
    - File(s): `packages/react/src/components/gradient-preview.tsx`
    - Details:
      - On the focused stop dot button, handle `onKeyDown` for Shift+F10 or the Context Menu key
      - Open the same context menu that right-click opens
      - The context menu already renders button elements, so it just needs a trigger path
    - Estimated effort: Small

17. [x] **Add keyboard equivalent for adding gradient stops**
    - File(s): `packages/react/src/components/gradient-stops.tsx`
    - Details:
      - Add a visually hidden "Add stop" button to the gradient stops area, OR handle a keyboard shortcut on the gradient bar
      - Alternative: Add an "Add Stop" button to the gradient controls in `presets.tsx`
    - Estimated effort: Small

18. [x] **Add aria-label to InputTrigger group**
    - File(s): `packages/react/src/components/input-trigger.tsx` (L233)
    - Details:
      - The `role="group"` div at the InputTrigger root needs `aria-label="Color picker controls"` or a similar descriptive label
    - Estimated effort: Small

**Validation**:
- [ ] `pnpm test` passes
- [ ] Screen reader announces slider orientation
- [ ] Keyboard-only users can access gradient context menu and add stops
- [ ] axe-core audit passes on demo page

### Phase 6: CSS Parsing & Utils

**Goal**: Improve CSS gradient parsing robustness, fix utility edge cases, and clean up module-level mutable state.

**Tasks**:
19. [ ] **Support two-position CSS stops**
    - File(s): `packages/react/src/utils/css.ts` -- `parseSingleStop` function (L116-135)
    - Details:
      - CSS allows `red 20% 40%` which means two stops at positions 20% and 40% with the same color
      - Update the regex at L120 to capture an optional second percentage
      - When found, return two stop objects from the parser (requires changing return type to array)
      - Update `parseColorStops` to handle the flat-mapped result
    - Estimated effort: Medium

20. [ ] **Handle repeating-*-gradient in fromCSS**
    - File(s): `packages/react/src/utils/css.ts` -- `fromCSS` function (L178-211)
    - Details:
      - Add regex matching for `repeating-linear-gradient`, `repeating-radial-gradient`, `repeating-conic-gradient`
      - Strip the `repeating-` prefix and parse as the corresponding gradient type
      - Optionally add a `repeating?: boolean` field to GradientValue, or just strip and document the limitation
    - Estimated effort: Small

21. [ ] **Fix getRelativePosition axis independence**
    - File(s): `packages/react/src/utils/position.ts` -- `getRelativePosition` (L16)
    - Details:
      - Current: `if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 }` -- if width is zero but height is non-zero, the y-axis is unnecessarily zeroed
      - Fix: Guard each axis independently:
        ```ts
        return {
          x: rect.width === 0 ? 0 : clamp((clientX - rect.left) / rect.width, 0, 1),
          y: rect.height === 0 ? 0 : clamp((clientY - rect.top) / rect.height, 0, 1),
        }
        ```
    - Estimated effort: Small

22. [ ] **Make updateStop sort after position change**
    - File(s): `packages/react/src/utils/gradient.ts` -- `updateStop` function (L80-91)
    - Details:
      - Currently updates the stop in-place via `map` but does not sort
      - `addStop` calls `sortStops` but `updateStop` does not -- inconsistency
      - Add `sortStops()` call after the map operation when `updates` includes `position`
    - Estimated effort: Small

23. [ ] **Replace stopIdCounter with consistent ID generation**
    - File(s): `packages/react/src/utils/css.ts` (L171)
    - Details:
      - Replace `let stopIdCounter = 0` with calls to `generateStopId()` from `gradient.ts` (which uses `Math.random().toString(36).slice(2, 10)`)
      - Export `generateStopId` from `gradient.ts` if not already exported
      - This eliminates cross-test state contamination and module-level mutable state
    - Estimated effort: Small

24. [ ] **Cancel requestAnimationFrame on unmount in useTokenDropdown**
    - File(s): `packages/react/src/hooks/use-token-dropdown.ts` -- `closeTokenDropdown` (L81-84)
    - Details:
      - Add `const rafRef = useRef<number | null>(null)`
      - Store the rAF ID: `rafRef.current = requestAnimationFrame(...)`
      - Add cleanup effect: `useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, [])`
    - Estimated effort: Small

**Validation**:
- [ ] `pnpm test` passes
- [ ] `fromCSS("linear-gradient(to right, red 20% 40%, blue)")` returns 3 stops
- [ ] `fromCSS("repeating-linear-gradient(45deg, red, blue 50%)")` parses successfully
- [ ] `getRelativePosition` returns correct y when width is 0 but height is non-zero
- [ ] `updateStop` with position change returns sorted stops

### Phase 7: Build & Config

**Goal**: Fix package configuration for npm publish readiness, clean up barrel exports, and improve CSS theming.

**Tasks**:
25. [ ] **Add publishConfig to package.json**
    - File(s): `packages/react/package.json`
    - Details: Add `"publishConfig": { "access": "public" }` to the package manifest
    - Estimated effort: Small

26. [ ] **Add LICENSE file**
    - File(s): Create `packages/react/LICENSE`, create `LICENSE` at repo root
    - Details:
      - Create MIT license text files
      - Add `"LICENSE"` to the `files` array in `packages/react/package.json`
    - Estimated effort: Small

27. [ ] **Fix exports map types condition**
    - File(s): `packages/react/package.json`
    - Details:
      - Current structure nests `types` inside `import`/`require` conditions:
        ```json
        ".": { "import": { "types": "...", "default": "..." }, "require": { "types": "...", "default": "..." } }
        ```
      - Change to top-level `types` condition:
        ```json
        ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" }
        ```
      - Apply same pattern to `"./presets"` entry
    - Estimated effort: Small

28. [ ] **Remove internal utils from barrel exports**
    - File(s): `packages/react/src/index.ts`
    - Details:
      - Remove exports of: `clamp`, `getRelativePosition`, `angleFromPosition`, `usePointerDrag`
      - These are internal implementation details not meant for public consumption
      - Keep all other currently exported utilities, hooks, components, and types
    - Estimated effort: Small

29. [ ] **Remove ^build dep from test task in turbo.json**
    - File(s): `turbo.json`
    - Details:
      - Change test task from `{ "dependsOn": ["^build"], "outputs": [] }` to `{ "outputs": [] }`
      - Vitest transforms TypeScript source directly via its own transform pipeline; it does not need the built output
    - Estimated effort: Small

30. [ ] **Add @layer cp wrapping to styles.css**
    - File(s): `packages/react/src/styles.css`
    - Details:
      - Wrap all styles in `@layer cp { ... }`
      - This lets Tailwind v4 users easily override library styles without specificity fights
      - The `:root` custom property declarations should remain outside the layer (or in a separate layer) so they cascade normally
    - Estimated effort: Small

31. [ ] **DRY up dark mode variable duplication**
    - File(s): `packages/react/src/styles.css`
    - Details:
      - Current: 40 lines of identical dark mode variables duplicated between `@media (prefers-color-scheme: dark) { :root { ... } }` (L60-78) and `.dark { ... }` (L84-100)
      - Fix: Use a combined selector approach: `@media (prefers-color-scheme: dark) { :root:not(.light) { ... } }` plus `.dark { ... }` sharing the same variables via a CSS custom property reference pattern or a single source of truth
      - Alternative: Accept the duplication but add a comment explaining why (simpler, less fragile)
    - Estimated effort: Small

**Validation**:
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] TypeScript resolves types correctly with the new exports map (test with `moduleResolution: "bundler"` and `"node16"`)
- [ ] LICENSE file is included in the published package
- [ ] Internal utils (`clamp`, `getRelativePosition`, etc.) are no longer importable from `@markoradak/color-picker`

### Phase 8: Tests

**Goal**: Add comprehensive test coverage for all hooks, untested components, keyboard interactions, and pointer drag patterns. Run last to validate all changes from phases 1-7.

**Tasks**:
32. [ ] **Add useColorPicker tests**
    - File(s): Create `packages/react/src/hooks/use-color-picker.test.ts`
    - Details:
      - Use `renderHook` from `@testing-library/react`
      - Test scenarios:
        - Uncontrolled: `defaultValue` initializes correctly
        - Controlled: `value` prop changes update HSVA
        - `isInternalUpdateRef` (or `expectedNextValueRef` after Task 3) guard prevents double HSVA sync
        - `setColorFromString` with invalid input guards via `isValidColor`
        - `syncHSVA` updates HSVA without firing `onValueChange`
        - `tokenReverseMap` builds correctly and `matchedToken` resolves
        - `toggleFormat` cycles hex -> rgb -> hsl -> hex
        - `formattedValue` reflects current format
    - Estimated effort: Large

33. [ ] **Add useGradient tests**
    - File(s): Create `packages/react/src/hooks/use-gradient.test.ts`
    - Details:
      - Test scenarios:
        - `handleAddStop` selects newly added stop as active
        - `handleRemoveStop` falls back to first stop when active is removed
        - `prevValueRef` resets `activeStopId` when parent swaps gradient
        - All callback operations: addStop, removeStop, updateStopColor, updateStopPosition, updateStopCoordinates, setGradientType, setAngle, setCenter, setBaseColor, moveStop, replaceGradient
        - Controlled and uncontrolled modes
    - Estimated effort: Large

34. [ ] **Add usePointerDrag tests**
    - File(s): Create `packages/react/src/hooks/use-pointer-drag.test.ts`
    - Details:
      - Test scenarios:
        - Non-primary button clicks ignored (`event.button !== 0`)
        - `isDragging` transitions to true on pointerdown, false on pointerup
        - `onDragStart`, `onDrag`, `onDragEnd` fire in correct sequence
        - Cleanup removes document event listeners on unmount
        - `pointercancel` does NOT call `onDragEnd`
        - Multi-touch guard prevents double-attachment
    - Estimated effort: Medium

35. [ ] **Add useTokenDropdown tests**
    - File(s): Create `packages/react/src/hooks/use-token-dropdown.test.ts`
    - Details:
      - Test scenarios:
        - `handleBadgeClick` toggles `tokenListOpen`
        - `handleBadgeKeyDown` opens on ArrowDown/ArrowUp
        - `handleTokenSelect` calls `onSelectToken` then closes
        - `closeTokenDropdown` resets search and restores focus
        - `handleSearchKeyDown` Escape closes dropdown
        - Click-outside dismissal via pointerdown
    - Estimated effort: Medium

36. [ ] **Add sanitizeColor and createDefaultGradientFromColor tests**
    - File(s): `packages/react/src/utils/css.test.ts` (add `describe("sanitizeColor")`), `packages/react/src/utils/gradient.test.ts` (add `describe("createDefaultGradientFromColor")`)
    - Details:
      - sanitizeColor: Valid colors pass through unchanged; invalid colors return "transparent"; edge cases: empty string, "inherit", "currentColor"
      - createDefaultGradientFromColor: All 4 gradient types created with correct defaults; first stop uses the provided color; correct angle/center/baseColor defaults per type
    - Estimated effort: Small

37. [ ] **Add keyboard interaction tests for sliders**
    - File(s): Create `packages/react/src/components/area.test.tsx` or add to `color-picker.test.tsx`
    - Details:
      - Test ArrowRight/ArrowLeft/ArrowUp/ArrowDown on Area
      - Test Shift+Arrow for 10-step jumps
      - Test ArrowRight/ArrowLeft on HueSlider (1-degree step, 10-degree with Shift)
      - Test ArrowRight/ArrowLeft on AlphaSlider (0.01 step)
      - Verify `aria-valuenow` updates after keyboard interaction
    - Estimated effort: Medium

38. [ ] **Add TokenList component tests**
    - File(s): Create `packages/react/src/components/token-list.test.tsx`
    - Details:
      - Renders list of tokens with `role="option"`
      - ArrowDown/ArrowUp navigation with wrapping
      - Home/End jump to first/last
      - Escape calls `onClose`
      - Search filter narrows results
      - Empty state shows "No matches"
      - `aria-selected` on matched token
      - Click fires `onSelect`
    - Estimated effort: Medium

39. [ ] **Add pointer drag interaction test pattern**
    - File(s): Create pattern in `packages/react/src/components/area.test.tsx` or a dedicated test file
    - Details:
      - Establish the reusable pattern for testing pointer interactions:
        - Use `fireEvent.pointerDown` on the slider element
        - Use `fireEvent.pointerMove` on `document` (since listeners attach to document)
        - Use `fireEvent.pointerUp` on `document`
      - Verify `onDragStart`/`onDrag`/`onDragEnd` callbacks
      - This pattern unlocks coverage for Area, HueSlider, AlphaSlider, GradientStops, GradientPreview
    - Estimated effort: Medium

**Validation**:
- [ ] `pnpm test` passes with all new tests
- [ ] Test count increases significantly from the current 234
- [ ] All hooks have dedicated test files
- [ ] Keyboard interactions are verified for all interactive components
- [ ] Pointer drag pattern is established and documented

---

## Technical Considerations

### Dependencies

- No new external dependencies required
- All changes use existing React APIs (useEffect, useRef, useMemo, useCallback, forwardRef)
- Vitest + @testing-library/react already available for new tests

### Constraints

- TypeScript 5.9 strict mode with `noUncheckedIndexedAccess` -- all array access must use `!` assertion or guard
- React 19 peer dependency but library supports >= 18 -- cannot use React 19-only APIs
- Phase 4 (discriminated union) is a BREAKING CHANGE -- acceptable since library is pre-1.0
- `colord` is the color math library -- do not introduce alternative color libraries
- Tests run in jsdom environment -- no real browser APIs (EyeDropper, pointer capture, etc.)

### Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Phase 4 discriminated union causes widespread type errors | High | High | Update all consumers methodically; run typecheck after each file |
| Moving render-phase mutations to useEffect introduces flash of stale state | Med | Low | The extra render cycle is imperceptible; test with controlled components |
| Removing internal exports from barrel breaks external consumers | Med | Low | Library is pre-1.0 and unpublished; document in changelog |
| Stabilizing gradient callbacks via ref may cause stale reads | Med | Low | Callbacks only run in response to user events, not during render |
| Phase 8 test additions may reveal additional bugs | Med | Med | Fix any discovered bugs as part of the test phase |

### Open Questions

- Should `repeating-*-gradient` parsing add a `repeating` field to GradientValue, or silently strip it?
- Should the "Add Stop" keyboard equivalent be a visually hidden button or a keyboard shortcut?
- For the discriminated union, should `MeshGradientValue` share the `BaseGradientValue` base (it has `stops` but with a different stop type)?
- Should `startPoint`/`endPoint` move to useGradient hook state or to a separate `useGradientUI` hook?

---

## Files Involved

### New Files
- `packages/react/src/hooks/use-color-picker.test.ts` - Hook unit tests
- `packages/react/src/hooks/use-gradient.test.ts` - Hook unit tests
- `packages/react/src/hooks/use-pointer-drag.test.ts` - Hook unit tests
- `packages/react/src/hooks/use-token-dropdown.test.ts` - Hook unit tests
- `packages/react/src/components/token-list.test.tsx` - Component integration tests
- `packages/react/src/components/area.test.tsx` - Keyboard and pointer interaction tests
- `packages/react/LICENSE` - MIT license file
- `LICENSE` - Repo root MIT license file

### Modified Files
- `packages/react/src/hooks/use-color-picker.ts` - Tasks 1, 3, 5
  - Move render-phase sync to useEffect, replace boolean ref, memoize return
- `packages/react/src/hooks/use-gradient.ts` - Tasks 1, 4, 12
  - Move render-phase sync to useEffect, stabilize callbacks via gradientRef, extract startPoint/endPoint
- `packages/react/src/hooks/use-token-dropdown.ts` - Task 24
  - Cancel rAF on unmount
- `packages/react/src/components/input.tsx` - Task 2
  - Add `tokens` to commitValue deps
- `packages/react/src/components/input-trigger.tsx` - Tasks 2, 7, 18
  - Add `tokens` to commitValue deps, add forwardRef, add aria-label
- `packages/react/src/components/area.tsx` - Tasks 6, 7, 14
  - HTML props spreading, forwardRef on sub-components, aria-orientation
- `packages/react/src/components/hue-slider.tsx` - Tasks 6, 7, 14
  - HTML props spreading, forwardRef on sub-components, aria-orientation
- `packages/react/src/components/alpha-slider.tsx` - Tasks 6, 7, 14
  - HTML props spreading, forwardRef on sub-components, aria-orientation
- `packages/react/src/components/swatches.tsx` - Tasks 6, 7, 9
  - HTML props spreading, forwardRef, event composition
- `packages/react/src/components/gradient-swatches.tsx` - Tasks 6, 7, 9
  - HTML props spreading, forwardRef, event composition
- `packages/react/src/components/mode-selector.tsx` - Tasks 6, 7, 9
  - HTML props spreading, forwardRef, event composition
- `packages/react/src/components/format-toggle.tsx` - Task 6
  - HTML props spreading
- `packages/react/src/components/eye-dropper.tsx` - Task 6
  - HTML props spreading
- `packages/react/src/components/gradient-editor.tsx` - Task 6
  - HTML props spreading
- `packages/react/src/components/gradient-preview.tsx` - Tasks 7, 12, 15, 16
  - forwardRef, startPoint/endPoint from hook state, aria-expanded, keyboard context menu
- `packages/react/src/components/gradient-stops.tsx` - Tasks 7, 15, 17
  - forwardRef, aria-expanded, keyboard add stop
- `packages/react/src/components/color-picker-provider.tsx` - Task 7
  - forwardRef
- `packages/react/src/components/token-list.tsx` - Task 7
  - forwardRef
- `packages/react/src/types.ts` - Tasks 8, 10, 11, 12, 13
  - Remove orientation, discriminated union, MeshGradientStop, remove startPoint/endPoint, extract TokenListClassNames
- `packages/react/src/utils/css.ts` - Tasks 19, 20, 23
  - Two-position stops, repeating gradients, replace stopIdCounter
- `packages/react/src/utils/position.ts` - Task 21
  - Independent axis guards
- `packages/react/src/utils/gradient.ts` - Tasks 22, 23
  - Sort after updateStop, export generateStopId
- `packages/react/src/index.ts` - Task 28
  - Remove internal exports
- `packages/react/src/styles.css` - Tasks 30, 31
  - @layer wrapping, DRY dark mode
- `packages/react/package.json` - Tasks 25, 26, 27
  - publishConfig, LICENSE in files, exports map fix
- `turbo.json` - Task 29
  - Remove ^build from test task
- `packages/react/src/utils/css.test.ts` - Task 36
  - Add sanitizeColor tests
- `packages/react/src/utils/gradient.test.ts` - Task 36
  - Add createDefaultGradientFromColor tests

### Related Files (for reference)
- `packages/react/src/components/color-picker.tsx` - Context provider that consumes useColorPicker return
- `packages/react/src/components/color-picker-context.ts` - Context definition
- `packages/react/src/components/presets.tsx` - Pre-composed components that use all sub-components
- `packages/react/src/components/shared.ts` - Shared style constants

---

## Testing Strategy

### Unit Tests
- All 4 hooks: useColorPicker, useGradient, usePointerDrag, useTokenDropdown (via `renderHook`)
- Utility additions: sanitizeColor edge cases, createDefaultGradientFromColor, two-position stop parsing, repeating gradient parsing
- Updated updateStop sort behavior
- Independent axis getRelativePosition

### Integration Tests
- TokenList component with keyboard navigation, search, selection
- Keyboard interactions on Area, HueSlider, AlphaSlider
- Pointer drag interaction pattern on Area

### Manual Testing
- [ ] Controlled color picker with rapidly changing value prop (Concurrent Mode stress test)
- [ ] Token auto-detection followed by blur/Enter validation
- [ ] Gradient stop drag at 60fps (profile with React DevTools)
- [ ] HTML prop spreading: `data-testid`, custom `onClick`, `style` overrides
- [ ] Screen reader walkthrough of gradient editor controls
- [ ] Tailwind v4 project consuming the library with `@layer` ordering

### Edge Cases
- Zero-width or zero-height element with getRelativePosition
- Two-position CSS stops: `red 20% 40%` -> 2 stops at 20% and 40%
- `repeating-linear-gradient` with no explicit stops
- Controlled value change during an active drag
- Token auto-detection completing after input is focused
- Unmounting during active drag (event listener cleanup)
- Unmounting during rAF in closeTokenDropdown

---

## References

### Documentation
- `CLAUDE.md` -- Full project structure, patterns, and conventions
- `packages/react/src/types.ts` -- All public TypeScript types
- `packages/react/src/styles.css` -- CSS custom properties theme API

### Related Work
- `tasks/plans/PLAN_00_INITIAL.md` -- Original 50-task implementation plan
- `tasks/plans/PLAN_01_FIXES.md` -- Previous 37-task bug fix and polish plan

### Code Examples
- `packages/react/src/hooks/use-color-picker.ts:53-63` -- Render-phase state mutation to fix (Task 1)
- `packages/react/src/hooks/use-gradient.ts:37-43` -- Render-phase state mutation to fix (Task 1)
- `packages/react/src/components/input.tsx:50-60` -- Stale tokens closure to fix (Task 2)
- `packages/react/src/hooks/use-gradient.ts:52-152` -- All callbacks with `gradient` in deps to stabilize (Task 4)
- `packages/react/src/utils/css.ts:116-135` -- parseSingleStop to extend (Task 19)
- `packages/react/src/utils/css.ts:171` -- stopIdCounter to replace (Task 23)
- `packages/react/src/utils/position.ts:16` -- Zero-size guard to fix (Task 21)

---

## Deployment & Rollout

### Prerequisites
- [ ] All 8 phases completed and validated
- [ ] All tests pass (existing 234 + new tests)
- [ ] `pnpm build` produces valid dual-format output
- [ ] `pnpm typecheck` passes with stricter types
- [ ] Demo site works correctly with the changes

### Deployment Steps
1. Complete all 8 phases in sequence
2. Run full validation suite: `pnpm build && pnpm typecheck && pnpm test`
3. Test demo site: `pnpm dev` and verify all playground interactions
4. Create PR from `feat-restyle` to `feat/color-picker`
5. After merge, publish with `npm publish` (publishConfig ensures public access)

### Rollback Plan
- Each phase is committed separately; can revert individual phase commits
- The discriminated union (Phase 4) is the highest-risk change; revert that phase specifically if consumers report type errors

### Monitoring
- Test count should increase from 234 to approximately 300+
- Build size should remain approximately the same (no new dependencies)
- TypeScript strict mode should catch any regressions immediately

---

## Success Metrics

### Immediate
- All 39 tasks completed and checked off
- Test count increases from 234 to 300+
- Zero TypeScript errors with stricter types
- `pnpm build` output size remains stable

### Short-term (1-2 weeks)
- No bug reports related to Concurrent Mode behavior
- No reports of stale token validation
- Demo site performance profiling shows no unnecessary re-renders during drag

### Long-term
- Library ready for 0.1.0 publish with clean public API
- Discriminated union prevents invalid gradient construction at the type level
- Test coverage provides confidence for future changes

---

## Notes & Observations

- The render-phase state mutation pattern in Tasks 1 and 3 is a common React anti-pattern that works in synchronous rendering but breaks under Concurrent Mode. Since the library declares `react >= 18` peer dependency, this must be fixed for React 18/19 concurrent features.
- Phase 4 (discriminated union) is the most invasive change and will touch the most files. It should be done as a single focused effort to avoid partial type migration states.
- Phase 8 (tests) is intentionally last because it validates all the changes from phases 1-7. New tests may also uncover additional issues that need fixing.
- The `usePointerDrag` export removal (Task 28) is justified because consumers should not build custom drag interactions using the library's internal hook. If there's demand, it can be re-exported as a documented public API later.
- The `@layer cp` wrapping (Task 30) is important for Tailwind v4 interop where layers control specificity. Without it, library styles may override Tailwind utility classes.

---

**Last Updated**: 2026-03-07T00:00:00Z
**Generated By**: `/plan` command
**Next Steps**: Review and refine the plan, then use `/kickoff DEEP_FIXES` to start implementation
