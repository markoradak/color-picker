# Comprehensive Audit Fixes Plan

## Overview
Deep analysis of the `@markoradak/color-picker` library revealed bugs, accessibility gaps, code quality issues, performance problems, and missing features across hooks, utilities, components, tests, build config, CSS theming, and the demo site. This plan addresses all findings organized by priority and dependency order.

## Branch
`feat-restyle` (current branch)

---

## Phase 1: P0 Bugs — Silent Data Corruption & Broken API

### Task 1.1: Fix `fromCSS` stub returning wrong type
**Files:** `packages/react/src/utils/css.ts`
**Problem:** `fromCSS` is exported publicly, typed as `ColorPickerValue`, but always returns the raw input string. Consumers calling `fromCSS("linear-gradient(...)")` get a runtime TypeError when accessing `.stops`.
**Fix:** Implement basic CSS gradient parsing that extracts gradient type, angle/position, and color stops from CSS gradient strings. Support `linear-gradient`, `radial-gradient`, `conic-gradient`. For inputs that can't be parsed, return the string as-is (SolidColor). Update the TODO comment. Update `css.test.ts` with new tests for gradient parsing.

### Task 1.2: Fix `initialHSVA` always black when tokens are used
**Files:** `packages/react/src/hooks/use-color-picker.ts`
**Problem:** The `useMemo(() => toHSVA(resolveToken(currentValue, tokens)), [])` captures stale `tokens` (always `undefined` on first render because `useAutoTokens` defers to `useEffect`). Token values silently become black.
**Fix:** Replace the `useMemo` + separate `useState` pair with a single lazy `useState` initializer:
```ts
const [hsva, setHSVA] = useState<HSVA>(() => {
  if (typeof currentValue === "string") {
    return toHSVA(resolveToken(currentValue, tokens ?? {}));
  }
  return { h: 0, s: 0, v: 0, a: 1 };
});
```
Remove the now-unnecessary `initialHSVA` variable.

### Task 1.3: Fix gradient `activeStop` becoming null on external value replacement
**Files:** `packages/react/src/hooks/use-gradient.ts`
**Problem:** `activeStopId` is set once from `gradient.stops[0]?.id`. When the parent replaces the gradient (e.g., selecting a swatch), new stops have different IDs. `activeStop` becomes `null`.
**Fix:** Add render-time sync that detects when `activeStopId` no longer exists in the current stops and resets it:
```ts
const prevValueRef = useRef(value);
if (value !== prevValueRef.current) {
  prevValueRef.current = value;
  if (value && !value.stops.some((s) => s.id === activeStopId)) {
    setActiveStopId(value.stops[0]?.id ?? null);
  }
}
```

### Task 1.4: Fix `createDefaultGradient` called on every render
**Files:** `packages/react/src/hooks/use-gradient.ts`
**Problem:** `const gradient = value ?? createDefaultGradient("linear")` generates new stop IDs via `Math.random()` on every render when `value` is undefined, making `activeStopId` perpetually stale.
**Fix:** Stabilize with a ref:
```ts
const defaultGradientRef = useRef<GradientValue | null>(null);
if (!defaultGradientRef.current) {
  defaultGradientRef.current = createDefaultGradient("linear");
}
const gradient = value ?? defaultGradientRef.current;
```

### Task 1.5: Fix `getRelativePosition` NaN when element has zero size
**Files:** `packages/react/src/utils/position.ts`
**Problem:** Division by zero when `rect.width` or `rect.height` is 0 produces NaN that propagates into HSVA state.
**Fix:** Add zero-size guard before division:
```ts
if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
```
Add test case in `position.test.ts`.

### Task 1.6: Add `toHSVA` invalid-input guard
**Files:** `packages/react/src/utils/color.ts`
**Problem:** `toHSVA` silently returns black `{h:0, s:0, v:0, a:1}` for invalid input (CSS variables, empty strings, gradient strings). No error surfaced.
**Fix:** Add `isValidColor` check before conversion. Return white `{h:0, s:0, v:100, a:1}` for invalid input (more visible than silent black). Add test cases in `color.test.ts`.

---

## Phase 2: P1 Memory Leaks & Event Handling

### Task 2.1: Add `pointercancel` handler to `usePointerDrag`
**Files:** `packages/react/src/hooks/use-pointer-drag.ts`
**Problem:** When the OS interrupts a touch gesture, `pointercancel` fires instead of `pointerup`. Without a handler, `isDragging` stays true, listeners leak permanently.
**Fix:** Create a separate `handlePointerCancel` that cleans up state without calling `onDragEnd` (since coordinates are unreliable). Register it alongside `pointerup`. Include it in the cleanup effect.

### Task 2.2: Guard against double event listeners on multi-touch
**Files:** `packages/react/src/hooks/use-pointer-drag.ts`
**Problem:** A second `pointerdown` (second finger) adds new listeners while overwriting `listenersRef.current`, leaking the first pair.
**Fix:** Add early return at the top of `handlePointerDown`:
```ts
if (listenersRef.current) return;
```

### Task 2.3: Add drag listener cleanup to gradient components
**Files:** `packages/react/src/components/gradient-preview.tsx`, `packages/react/src/components/gradient-stops.tsx`
**Problem:** Both register `document` `pointermove`/`pointerup` listeners during drag but have no `useEffect` cleanup if the component unmounts mid-drag.
**Fix:** Add a ref to track active drag listeners and a `useEffect` cleanup that removes them on unmount, mirroring the pattern in `use-pointer-drag.ts:68-75`.

---

## Phase 3: Accessibility

### Task 3.1: Fix `ColorPickerArea` ARIA attributes
**Files:** `packages/react/src/components/area.tsx`
**Problem:** Missing required `aria-valuemin`, `aria-valuemax`, `aria-valuenow` for `role="slider"`.
**Fix:** Add `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-valuenow={Math.round(hsva.s)}` to the area div.

### Task 3.2: Add keyboard operation to gradient stop dots
**Files:** `packages/react/src/components/gradient-preview.tsx`, `packages/react/src/components/gradient-stops.tsx`
**Problem:** Stop dots cannot be repositioned or removed via keyboard.
**Fix:** Add `onKeyDown` handler to each stop button:
- `ArrowLeft`/`ArrowRight`: step position by 1% (shift = 10%)
- `Delete`/`Backspace`: remove stop (if more than 2 stops)

### Task 3.3: Fix `ColorPickerModeSelector` roving tabIndex
**Files:** `packages/react/src/components/mode-selector.tsx`
**Problem:** Every button has `tabIndex={0}`, no arrow-key navigation. Standard radio group pattern requires roving focus.
**Fix:** Set `tabIndex={isActive ? 0 : -1}` on each item. Add `onKeyDown` on the group for `ArrowLeft`/`ArrowRight` to move focus and selection.

### Task 3.4: Add live region to eye dropper
**Files:** `packages/react/src/components/eye-dropper.tsx`
**Problem:** Screen reader users get no feedback when picking starts or completes.
**Fix:** Update `aria-label` dynamically based on state: `"Pick a color from the screen"` (idle), `"Picking color..."` (picking), `"Color picked"` (confirmed).

### Task 3.5: Fix token list `disabled` vs `aria-disabled`
**Files:** `packages/react/src/components/token-list.tsx`
**Problem:** `disabled` attribute on `<button role="option">` removes element from accessibility tree in some AT.
**Fix:** Replace `disabled={disabled}` with `aria-disabled={disabled || undefined}` and guard `onClick` manually.

### Task 3.6: Add `prefers-reduced-motion` to styles
**Files:** `packages/react/src/styles.css`
**Problem:** Animations run regardless of user motion preference.
**Fix:** Add `@media (prefers-reduced-motion: reduce)` block that disables `cp-spin` and `cp-token-list-in` animations and zeros out transition durations.

---

## Phase 4: Code Quality & DRY

### Task 4.1: Extract shared `useTokenDropdown` hook
**Files:** New file `packages/react/src/hooks/use-token-dropdown.ts`, then refactor `packages/react/src/components/input.tsx` and `packages/react/src/components/input-trigger.tsx`
**Problem:** ~120 lines of token dropdown state machine (open/close, search, refs, click-outside, keyboard handlers) duplicated verbatim between two files.
**Fix:** Create `useTokenDropdown` hook that encapsulates:
- `tokenListOpen` / `setTokenListOpen` state
- `tokenSearch` / `setTokenSearch` state
- All refs (`tokenSearchRef`, `tokenListRef`, `tokenBadgeRef`, `tokenSearchWrapperRef`)
- `closeTokenDropdown`, `handleTokenSelect`, `handleBadgeClick`, `handleBadgeKeyDown`, `handleSearchChange`, `handleSearchKeyDown`
- Click-outside `useEffect`

Both `input.tsx` and `input-trigger.tsx` then consume this hook, keeping only their rendering differences (inline vs portal).

### Task 4.2: Fix `ColorPickerTrigger` to display gradients
**Files:** `packages/react/src/components/trigger.tsx`
**Problem:** Always shows solid-color swatch from `fromHSVA(hsva)`, even in gradient mode. `InputTrigger` handles this correctly.
**Fix:** Read `isGradientMode` and `gradient` from context. When in gradient mode, use `toCSS(gradient.gradient)` as the `background` CSS property instead of `backgroundColor`.

### Task 4.3: Hoist `emptySwatches` to module scope
**Files:** `packages/react/src/components/color-picker-provider.tsx`
**Problem:** `const emptySwatches: string[] = []` inside function body creates new reference every render.
**Fix:** Move to module-level constant: `const EMPTY_SWATCHES: string[] = [];`

### Task 4.4: Fix `GradientSwatches` array index key
**Files:** `packages/react/src/components/gradient-swatches.tsx`
**Problem:** Uses array index as React key, causing incorrect DOM recycling when filter changes.
**Fix:** Use `toCSS(gradient)` as key for stability.

### Task 4.5: Extract IIFE in `GradientPreview`
**Files:** `packages/react/src/components/gradient-preview.tsx`
**Problem:** IIFE inside JSX at ~L442-466 for gradient line SVG.
**Fix:** Extract to a local variable computed before the return statement.

---

## Phase 5: Performance

### Task 5.1: Deduplicate `fromHSVA` calls per drag frame
**Files:** `packages/react/src/hooks/use-color-picker.ts`
**Problem:** `formattedValue` and `cssValue` both independently call `fromHSVA(hsva)`, creating two colord instances per frame.
**Fix:** Derive `formattedValue` from `cssValue`:
```ts
const cssValue = useMemo(() => fromHSVA(hsva), [hsva]);
const formattedValue = useMemo(() => formatColor(cssValue, format), [cssValue, format]);
```

### Task 5.2: Build reverse token lookup map
**Files:** `packages/react/src/hooks/use-color-picker.ts`
**Problem:** `findMatchingToken` iterates all tokens doing HSVA round-trips per frame during drag. With Tailwind v4 palette, 400+ allocations per frame.
**Fix:** Build a reverse lookup map once when `tokens` changes:
```ts
const tokenReverseMap = useMemo(() => {
  if (!tokens) return null;
  const map: Record<string, string> = {};
  for (const [name, color] of Object.entries(tokens)) {
    map[fromHSVA(toHSVA(color))] = name;
  }
  return map;
}, [tokens]);

const matchedToken = useMemo(
  () => (tokenReverseMap ? tokenReverseMap[cssValue] ?? undefined : undefined),
  [cssValue, tokenReverseMap]
);
```

### Task 5.3: Fix format detection to resolve tokens first
**Files:** `packages/react/src/hooks/use-color-picker.ts`
**Problem:** `detectFormat(currentValue)` reads raw token name. A token named `"rgb-accent"` would incorrectly set initial format to `"rgb"`.
**Fix:**
```ts
const [format, setFormat] = useState<ColorFormat>(() => {
  if (typeof currentValue !== "string") return "hex";
  const resolved = resolveToken(currentValue, tokens ?? {});
  return detectFormat(resolved);
});
```

---

## Phase 6: Component API Consistency

### Task 6.1: Add `forwardRef` to remaining components
**Files:** `packages/react/src/components/area.tsx`, `hue-slider.tsx`, `alpha-slider.tsx`, `input.tsx`, `format-toggle.tsx`, `eye-dropper.tsx`, `swatches.tsx`, `mode-selector.tsx`, `gradient-editor.tsx`
**Problem:** Only `Trigger` and `Content` forward refs. All other components rendering DOM roots lack ref forwarding.
**Fix:** Wrap each component with `forwardRef`, pass the ref to the outermost DOM element. Update prop interfaces to include `ref`. Note: React 19 supports ref as a regular prop, so use the `ref` prop pattern (no need for `forwardRef` wrapper in React 19 — check the current implementation pattern and match).

### Task 6.2: Export missing component prop types
**Files:** `packages/react/src/types.ts`, `packages/react/src/index.ts`
**Problem:** `GradientPreview`, `GradientStops`, `ColorPickerControls`, `EyeDropper`, `FormatToggle` props defined inline, not exported.
**Fix:** Move interfaces to `types.ts`, export from `index.ts`.

### Task 6.3: Improve type safety for color fields
**Files:** `packages/react/src/types.ts`
**Problem:** `GradientStop.color` and `GradientValue.baseColor` typed as `string` instead of `SolidColor`. `GradientValue.type` and `ColorPickerMode` defined independently.
**Fix:**
- Change `GradientStop.color: string` to `GradientStop.color: SolidColor`
- Change `GradientValue.baseColor?: string` to `GradientValue.baseColor?: SolidColor`
- Extract `GradientType = "linear" | "radial" | "conic" | "mesh"` shared between both types

---

## Phase 7: CSS Theming

### Task 7.1: Make checkerboard dark-mode aware
**Files:** `packages/react/src/components/shared.ts`, `packages/react/src/styles.css`
**Problem:** `CHECKERBOARD_STYLE` hardcodes `#e5e5e5`, invisible in dark mode.
**Fix:** Change to `var(--cp-checkerboard-color, #e5e5e5)` in the inline style. Add `--cp-checkerboard-color` to `styles.css` with appropriate dark-mode value (e.g., `#404040`).

### Task 7.2: Unify z-index values
**Files:** `packages/react/src/components/input.tsx`, `packages/react/src/components/input-trigger.tsx`, `packages/react/src/styles.css`
**Problem:** Token dropdown uses `zIndex: 50` in one file and `99999` in another.
**Fix:** Use a CSS custom property `var(--cp-z-index-dropdown, 50)` in both components. For the portal version in `input-trigger.tsx`, use a higher default via a separate property or document that consumers should set this when using portals.

### Task 7.3: Add `--cp-font-family` and `--cp-transition-duration` tokens
**Files:** `packages/react/src/styles.css`
**Problem:** Font sizes and transition durations hardcoded across many selectors.
**Fix:** Add `--cp-font-family` and `--cp-transition-duration` CSS custom properties to `:root`. Replace hardcoded values in component selectors.

### Task 7.4: Fix token list animation delay
**Files:** `packages/react/src/styles.css`
**Problem:** 50ms delay with `both` fill causes a flash (element appears, vanishes, then fades in).
**Fix:** Remove the delay or switch to `forwards` fill mode.

---

## Phase 8: Mesh Gradient Fix

### Task 8.1: Fix mesh gradient transparent blending
**Files:** `packages/react/src/utils/css.ts`
**Problem:** Uses `transparent` (which is `rgba(0,0,0,0)`) as the radial endpoint, causing black-fringing artifacts on mesh gradient blobs.
**Fix:** Use a zero-alpha version of the stop color instead:
```ts
`radial-gradient(circle at ${stop.x ?? 50}% ${stop.y ?? 50}%, ${sanitizeColor(stop.color)} 0%, ${sanitizeColor(stop.color).replace(/\)$/, ', 0)')} 50%)`
```
Or use colord to create the transparent version properly. Update `css.test.ts`.

---

## Phase 9: Build & Packaging

### Task 9.1: Add missing `package.json` fields
**Files:** `packages/react/package.json`
**Fix:** Add `"bugs"`, `"homepage"`, and `"engines"` fields.

### Task 9.2: Add test output caching to Turborepo
**Files:** `turbo.json`
**Fix:** Add `"outputs": []` to the `"test"` task to enable Turborepo result caching.

---

## Phase 10: Demo Site Fixes

### Task 10.1: Create `/playground` route
**Files:** `apps/web/app/playground/page.tsx` (new file)
**Problem:** `/playground` returns 404. Only works as a section on the homepage.
**Fix:** Create `page.tsx` that imports and renders `PlaygroundClient`.

### Task 10.2: Fix preset code generation for `showInput`
**Files:** `apps/web/app/playground/playground-client.tsx`
**Problem:** Generates `enableFormatToggle={false}` when `showInput` is toggled off, but that only hides the format toggle, not the input.
**Fix:** Change the mapping so disabling `showInput` generates a comment explaining how to hide the input via `className` or composition, rather than emitting a misleading prop.

### Task 10.3: Remove dead import from code example
**Files:** `apps/web/app/page.tsx`
**Problem:** `COMPOUND_EXAMPLE` imports `ColorPickerGradientEditor` but never uses it.
**Fix:** Remove from import list.

### Task 10.4: Add missing components to reference table
**Files:** `apps/web/app/page.tsx`
**Problem:** Reference table missing `ColorPickerProvider`, `ColorPickerControls`, `GradientStops`, `TokenList`, hooks, and utilities.
**Fix:** Add missing entries to the `API_COMPONENTS` array. Add a separate hooks/utilities section.

---

## Execution Order & Dependencies

Phases should be executed in order (1 -> 10) as later phases may depend on earlier fixes. Within each phase, tasks are independent and can be parallelized.

**Estimated task count:** 33 tasks across 10 phases.

## Verification

After all phases:
1. `pnpm typecheck` passes
2. `pnpm test` passes (existing 165 tests + new tests)
3. `pnpm build` succeeds and `dist/` contains `.d.ts` files and `styles.css`
4. `pnpm dev` — demo site loads, playground works, all features functional
