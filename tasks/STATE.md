# State

**Active**: 02_DEEP_FIXES
**File**: tasks/plans/PLAN_02_DEEP_FIXES.md
**Phase**: 4
**Status**: In Progress
**Updated**: 2026-03-07T00:00:00Z

---

## Overview

| # | Plan | File | Status | Progress |
|---|------|------|--------|----------|
| 00 | INITIAL | PLAN_00_INITIAL.md | Complete | 50/50 tasks |
| 01 | FIXES | PLAN_01_FIXES.md | Complete | 37/37 tasks |
| 02 | DEEP_FIXES | PLAN_02_DEEP_FIXES.md | In Progress | 4/39 tasks |

---

## Plans

### PLAN_00_INITIAL

#### Phase 1: Foundation & Project Scaffolding -- Complete

| Task | Status |
|------|--------|
| 1.1 Initialize monorepo root | Complete |
| 1.2 Scaffold packages/react/ | Complete |
| 1.3 Scaffold apps/web/ | Complete |
| 1.4 Verify build pipeline | Complete |

#### Phase 2: Core Types & Color Utilities -- Complete

| Task | Status |
|------|--------|
| 2.1 Define TypeScript types | Complete |
| 2.2 Color utilities | Complete |
| 2.3 Gradient utilities | Complete |
| 2.4 CSS conversion utilities | Complete |
| 2.5 Position utilities | Complete |
| 2.6 Unit tests for all utilities | Complete |

#### Phase 3: Core Hooks & State Management -- Complete

| Task | Status |
|------|--------|
| 3.1 usePointerDrag hook | Complete |
| 3.2 useColorPicker hook | Complete |
| 3.3 useGradient hook | Complete |
| 3.4 Context system | Complete |
| 3.5 Tests for hooks | Complete |

#### Phase 4: Solid Color Picker Components -- Complete

| Task | Status |
|------|--------|
| 4.1 ColorPicker root component | Complete |
| 4.2 ColorPicker.Trigger | Complete |
| 4.3 ColorPicker.Content | Complete |
| 4.4 ColorPicker.Area | Complete |
| 4.5 ColorPicker.HueSlider | Complete |
| 4.6 ColorPicker.AlphaSlider | Complete |
| 4.7 ColorPicker.Input | Complete |
| 4.8 ColorPicker.FormatToggle | Complete |
| 4.9 ColorPicker.EyeDropper | Complete |
| 4.10 ColorPicker.Swatches | Complete |
| 4.11 Component tests | Complete |

#### Phase 5: Gradient Editor Components -- Complete

| Task | Status |
|------|--------|
| 5.1 GradientEditor | Complete |
| 5.2 GradientPreview | Complete |
| 5.3 GradientStops | Complete |
| 5.4 Nested color picker for gradient stops | Complete |
| 5.5 Linear gradient support | Complete |
| 5.6 Radial gradient support | Complete |
| 5.7 Conic gradient support | Complete |
| 5.8 Mesh gradient support | Complete |
| 5.9 Gradient component tests | Complete |

#### Phase 6: Pre-composed Components & Public API -- Complete

| Task | Status |
|------|--------|
| 6.1 ColorPickerPopover | Complete |
| 6.2 ColorPickerInline | Complete |
| 6.3 Finalize src/index.ts exports | Complete |
| 6.4 Configure package.json exports map | Complete |
| 6.5 CSS custom properties theme API | Complete |

#### Phase 7: Demo Site -- Complete

| Task | Status |
|------|--------|
| 7.1 Landing page | Complete |
| 7.2 Playground page | Complete |
| 7.3 Dark mode support | Complete |
| 7.4 Mobile responsive layout | Complete |

#### Phase 8: Testing, A11y & Polish -- Complete

| Task | Status |
|------|--------|
| 8.1 Comprehensive unit tests | Complete |
| 8.2 Component integration tests | Complete |
| 8.3 Accessibility audit | Complete |
| 8.4 Bundle size optimization | Complete |
| 8.5 Package README.md | Complete |
| 8.6 npm publish preparation | Complete |

### PLAN_01_FIXES

#### Phase 1: P0 Bugs -- Complete

| Task | Status |
|------|--------|
| 1.1 Fix fromCSS stub returning wrong type | Complete |
| 1.2 Fix initialHSVA always black when tokens are used | Complete |
| 1.3 Fix gradient activeStop becoming null on external value replacement | Complete |
| 1.4 Fix createDefaultGradient called on every render | Complete |
| 1.5 Fix getRelativePosition NaN when element has zero size | Complete |
| 1.6 Add toHSVA invalid-input guard | Complete |

#### Phase 2: P1 Memory Leaks & Event Handling -- Complete

| Task | Status |
|------|--------|
| 2.1 Add pointercancel handler to usePointerDrag | Complete |
| 2.2 Guard against double event listeners on multi-touch | Complete |
| 2.3 Add drag listener cleanup to gradient components | Complete |

#### Phase 3: Accessibility -- Complete

| Task | Status |
|------|--------|
| 3.1 Fix ColorPickerArea ARIA attributes | Complete |
| 3.2 Add keyboard operation to gradient stop dots | Complete |
| 3.3 Fix ColorPickerModeSelector roving tabIndex | Complete |
| 3.4 Add live region to eye dropper | Complete |
| 3.5 Fix token list disabled vs aria-disabled | Complete |
| 3.6 Add prefers-reduced-motion to styles | Complete |

#### Phase 4: Code Quality & DRY -- Complete

| Task | Status |
|------|--------|
| 4.1 Extract shared useTokenDropdown hook | Complete |
| 4.2 Fix ColorPickerTrigger to display gradients | Complete |
| 4.3 Hoist emptySwatches to module scope | Complete |
| 4.4 Fix GradientSwatches array index key | Complete |
| 4.5 Extract IIFE in GradientPreview | Complete |

#### Phase 5: Performance -- Complete

| Task | Status |
|------|--------|
| 5.1 Deduplicate fromHSVA calls per drag frame | Complete |
| 5.2 Build reverse token lookup map | Complete |
| 5.3 Fix format detection to resolve tokens first | Complete |

#### Phase 6: Component API Consistency -- Complete

| Task | Status |
|------|--------|
| 6.1 Add forwardRef to remaining components | Complete |
| 6.2 Export missing component prop types | Complete |
| 6.3 Improve type safety for color fields | Complete |

#### Phase 7: CSS Theming -- Complete

| Task | Status |
|------|--------|
| 7.1 Make checkerboard dark-mode aware | Complete |
| 7.2 Unify z-index values | Complete |
| 7.3 Add cp-font-family and cp-transition-duration tokens | Complete |
| 7.4 Fix token list animation delay | Complete |

#### Phase 8: Mesh Gradient Fix -- Complete

| Task | Status |
|------|--------|
| 8.1 Fix mesh gradient transparent blending | Complete |

#### Phase 9: Build & Packaging -- Complete

| Task | Status |
|------|--------|
| 9.1 Add missing package.json fields | Complete |
| 9.2 Add test output caching to Turborepo | Complete |

#### Phase 10: Demo Site Fixes -- Complete

| Task | Status |
|------|--------|
| 10.1 Create /playground route | Complete |
| 10.2 Fix preset code generation for showInput | Complete |
| 10.3 Remove dead import from code example | Complete |
| 10.4 Add missing components to reference table | Complete |

### PLAN_02_DEEP_FIXES

#### Phase 1: Critical Bugs

| Task | Status |
|------|--------|
| Fix render-phase state mutations in useColorPicker and useGradient | Pending |
| Fix stale tokens closure in commitValue | Pending |
| Fix isInternalUpdateRef fragility in useColorPicker | Pending |

#### Phase 2: Performance

| Task | Status |
|------|--------|
| Fix context re-render cascade during drag | Pending |
| Memoize useColorPicker return values | Pending |

#### Phase 3: API Completeness

| Task | Status |
|------|--------|
| Add HTML props spreading to all components | Pending |
| Add forwardRef to 14 exported components | Pending |
| Remove dead orientation prop from types | Pending |
| Add event handler composition utility | Pending |

#### Phase 4: Type Safety -- Complete

| Task | Status |
|------|--------|
| Convert GradientValue to discriminated union | Complete |
| Create separate MeshGradientStop type | Complete |
| Move startPoint/endPoint out of GradientValue | Complete |
| Extract shared TokenListClassNames interface | Complete |

#### Phase 5: Accessibility

| Task | Status |
|------|--------|
| Add aria-orientation to slider elements | Pending |
| Add aria-expanded to gradient stop triggers | Pending |
| Add keyboard access to gradient context menu | Pending |
| Add keyboard equivalent for adding gradient stops | Pending |
| Add aria-label to InputTrigger group | Pending |

#### Phase 6: CSS Parsing & Utils

| Task | Status |
|------|--------|
| Support two-position CSS stops | Pending |
| Handle repeating-*-gradient in fromCSS | Pending |
| Fix getRelativePosition axis independence | Pending |
| Make updateStop sort after position change | Pending |
| Replace stopIdCounter with consistent ID generation | Pending |
| Cancel requestAnimationFrame on unmount in useTokenDropdown | Pending |

#### Phase 7: Build & Config

| Task | Status |
|------|--------|
| Add publishConfig to package.json | Pending |
| Add LICENSE file | Pending |
| Fix exports map types condition | Pending |
| Remove internal utils from barrel exports | Pending |
| Remove ^build dep from test task in turbo.json | Pending |
| Add @layer cp wrapping to styles.css | Pending |
| DRY up dark mode variable duplication | Pending |

#### Phase 8: Tests

| Task | Status |
|------|--------|
| Add useColorPicker tests | Pending |
| Add useGradient tests | Pending |
| Add usePointerDrag tests | Pending |
| Add useTokenDropdown tests | Pending |
| Add sanitizeColor and createDefaultGradientFromColor tests | Pending |
| Add keyboard interaction tests for sliders | Pending |
| Add TokenList component tests | Pending |
| Add pointer drag interaction test pattern | Pending |
