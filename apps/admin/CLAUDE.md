# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

iEkklesia: UI de gestión de tesorería para iglesias (Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui). Originado en v0 de Vercel. **No hay backend real** — la app usa datos mock/seed (ver `lib/data.ts`, `lib/types.ts` y archivos `demo-data.ts`); no existen API routes ni base de datos.

## Comandos

Gestor de paquetes: **bun**. Linting y formateo con **Biome** (no ESLint ni Prettier).

- `bun run dev` — servidor de desarrollo
- `bun run build` — build de producción
- `bun run check` — Biome lint + format con autofix (`biome check --fix .`)
- `bun run lint` — solo lint
- `bun run format` — solo format
- No hay suite de tests configurada.

## Estilo de código

- Formateo definido en `biome.json`: 2 espacios de indentación, ancho de línea 100, fin de línea LF. Ejecuta `bun run check` o `bun run format` tras editar.
- Biome tiene `security: "error"`, `performance: "warn"`, `style: "warn"`, `correctness: "off"`.
- TypeScript en modo strict.
- Alias de imports: `@/*` resuelve a la raíz del proyecto (ej. `@/components/...`, `@/lib/...`, `@/hooks/...`).

## Estructura

- `app/(dashboard)/` — rutas del dashboard (budgets, receipts, reports, projects, movements, requests, voting, etc.).
- `components/` — UI compartida (`components/ui/` es shadcn/ui) y componentes por feature.
- `lib/` — utilidades, tipos y datos mock; `lib/reports/` para reportes.
- `hooks/` — hooks y stores de estado (ej. `voting-store.ts`).

## Gotchas

- `next.config.mjs` tiene `typescript.ignoreBuildErrors: true`: el build **no falla por errores de TS**. Valida tipos manualmente al hacer cambios.
- `images.unoptimized: true` — Next Image sin optimización.
- Existe un directorio `src/componentes/` (en español, junto a `components/` en inglés); confirma la ruta correcta al importar.
