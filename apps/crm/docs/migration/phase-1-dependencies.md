# CRM migration - Phase 1 (dependencies)

Scope: `apps/crm` only (plus `bun.lock`). Versions are pinned exactly, as CLAUDE.md requires.

## Result

| Check | Before | After |
|---|---|---|
| `tsc --noEmit` | 2 errors | 0 errors |
| `next build` | passed only because of `ignoreBuildErrors` | passes with type checking on (flag removed) |
| `bun audit` (monorepo) | 137 (8 critical) | 91 (3 critical) |

## Updated
next 16.4.6, react / react-dom 19.3.1, zod 4.6.7, @hookform/resolvers 7.0.7, tiptap 3.34 (StarterKit now bundles link and underline, the two extra packages were removed), recharts 3.11, sonner 2.0.8, react-resizable-panels 4.24, react-day-picker 10, lucide-react 1.74, @vercel/analytics 2.0.1, date-fns, react-hook-form, tailwind-merge, input-otp, tailwindcss and @tailwindcss/postcss 4.3.5, tw-animate-css, and the 27 `@radix-ui/react-*` packages replaced by the unified `radix-ui` package.

## Code changes forced by the upgrades
- zod 4: `required_error` / `invalid_type_error` replaced by the `error` option; `z.string().url()` replaced by `z.url()`.
- DayPicker: `initialFocus` renamed to `autoFocus`; calendar `table` class slot renamed to `month_grid`.
- lucide 1.x removed brand icons: the social links section now uses `react-icons/fa6` (already used by `apps/web`).
- react-resizable-panels 4: `PanelGroup` / `PanelResizeHandle` renamed to `Group` / `Separator`; data attributes replaced by `aria-orientation`.
- recharts 3: tooltip and legend prop types in `components/ui/chart.tsx` adapted.
- tiptap 3: `useEditor` can return `null`; the toolbar is rendered only when the editor exists.
- `components/ui/*` were edited by hand because the shadcn CLI could not reach its registry from this environment (proxy 403). Re-run `shadcn add <name> --overwrite` from a normal machine to compare them with the official output.
- `tsconfig.json`: `declaration` / `declarationMap` set to false (the app never emits types); otherwise `packages/auth` raised TS2742 after the tiptap upgrade.

## Not done
- TypeScript stays at 5.7.3 (shared root pin; 7.x is a major jump for the whole monorepo) and Biome at 2.4.8 (root pin).
- Remaining advisories are transitive dependencies of other workspaces (`undici`, `fast-uri`, `path-to-regexp` via `apps/web` / `packages/auth`), outside this scope.
- The Prisma client must be generated (`bun run db:generate`) before `tsc`, otherwise `website/page.tsx` reports an implicit `any`.
