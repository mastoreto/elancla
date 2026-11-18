# CRM migration - Phase 0 audit (baseline)

Base branch: `fix/ajustes` (commit 9f6c2c7). Scope: `apps/crm` only. No functional changes in this phase.

## Baseline

| Check | Result |
|---|---|
| `bun install --frozen-lockfile` | OK (870 packages) |
| `tsc --noEmit` (apps/crm) | 2 errors: `app/(dashboard)/website/page.tsx:40` (implicit `any` on `t`), `src/components/RichTextEditor.tsx:110` (tiptap `setContent` options type) |
| `biome lint --diagnostic-level=warn` | 1205 warnings (see below) |
| `next.config.mjs` | `typescript.ignoreBuildErrors: true`, hides the type errors above |
| `bun audit` (whole monorepo) | 137 advisories: 8 critical, 73 high, 42 moderate, 14 low |

### Biome warnings by rule
765 `noJsxLiterals` (hardcoded UI text, must move to i18n es/en/pt), 103 `useSolidForComponent`, 78 `noMagicNumbers`, 63 `useNamingConvention`, 44 `noNamespaceImport`, 34 `useBlockStatements`, 28 `useConsistentTypeDefinitions`, 17 `noDefaultExport`, 15 `noNestedTernary`, 15 `useComponentExportOnlyModules`. Most are in `components/ui` (shadcn, not edited by hand) or are `noJsxLiterals`.

### Security advisories (high/critical) by package
`undici` (transitive, fixed >=7.30.1), `next` 16.2.0 (8 advisories, latest 16.4.6), `fast-uri`, `sharp`, `picomatch`, `path-to-regexp`, `node-tar`, `nanoid`, `source-map-js`, `zod` (<4.6.6). Fix path: update `next` first, then `bun audit fix` within ranges, then majors one at a time.

## Dependencies behind (apps/crm)

Next 16.2.0 -> 16.4.6; React 19.2.4 -> 19.3.1; zod 3.25 -> 4.6; recharts 2.15 -> 3.11; tiptap 2.27 -> 3.34; @hookform/resolvers 3.10 -> 7.0; sonner 1.7 -> 2.0; react-resizable-panels 2.1 -> 4.24; react-day-picker 9.13 -> 10; lucide-react 0.564 -> 1.74; @vercel/analytics 1.6 -> 2.0; date-fns 4.1 -> 4.4; Biome 2.4.8 -> 2.6.8; Tailwind 4.3.1 -> 4.3.5; TypeScript 5.7.3 -> 7.0.2 (evaluate last). 28 `@radix-ui/react-*` packages are pinned individually; shadcn now ships the unified `radix-ui` package.

## Code quality findings

- `components/dashboard` and `src/components` coexist (typo + duplicate folder); `desing/` holds an old `Dashboard CMS.html` and uploads.
- `lib/data.ts` (462 lines) is mock data; `lib/church.ts`, `lib/types.ts` flat in `lib/`.
- Flat `components/*.tsx` (project-*, request-*, movements-*) do not follow the folder-per-component + barrel rule of CLAUDE.md.
- No `any` outside `components/ui`; the 2 type errors above are the only ones.
- Hardcoded Spanish text across pages (765 warnings), no i18n in the CRM yet.

## Proposed adjustments to the plan
1. Phase 1 starts with `next` (security), then in-range updates, then majors in this order: zod+resolvers, recharts, tiptap, sonner, resizable-panels, day-picker, lucide, radix unification.
2. Fix the 2 type errors and drop `ignoreBuildErrors` in Phase 1 so each upgrade is checked by the compiler.
3. i18n extraction (noJsxLiterals) is folded into Phase 3, section by section.
