# color-picker

Compound-component React color picker and gradient editor. Solid colors (HEX/RGB/HSL/OKLCH), linear/radial/conic/mesh gradients, color tokens, and WCAG contrast tooling.

- **Package:** [`@markoradak/color-picker`](./packages/react) — full API docs and usage
- **Demo site:** [`apps/web`](./apps/web) — live playground and examples
- **License:** MIT

## Repository layout

```
packages/
  react/          @markoradak/color-picker — publishable React package
apps/
  web/            Next.js demo + playground site
```

## Development

Requires Node 18+ and pnpm 10+.

```bash
pnpm install
pnpm dev          # run the demo site + package in watch mode
pnpm build        # build the package, then the demo site
pnpm typecheck    # typecheck all workspaces
```

Tests live in `packages/react`:

```bash
cd packages/react
pnpm test
```

## Installation

```bash
pnpm add @markoradak/color-picker
```

See [`packages/react/README.md`](./packages/react/README.md) for the full API.
