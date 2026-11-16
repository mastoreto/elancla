# ancla-monorepo

Monorepo (Turborepo + Bun) de la Iglesia El Ancla: sitio público + backoffice.

## Estructura

```
apps/
  web/      el ancla — sitio público (Astro 6 + islas React 19)
  admin/    iEkklesia — backoffice / tesorería / CMS custom (Next.js 16, App Router)
packages/
  content/            @ancla/content            dominio de contenido (CMS custom como librería)
  db/                 @ancla/db                 capa de datos Prisma (scaffold)
  utils/              @ancla/utils              cn(), helpers compartidos
  env/                @ancla/env                validación de env (t3-env, scaffold)
  typescript-config/  @ancla/typescript-config  bases tsconfig (base/nextjs/astro/react-library)
  biome-config/       @ancla/biome-config       config Biome compartida
```

### Qué es global y qué no

- **Global** (`packages/`): contenido (`@ancla/content`), datos (`@ancla/db`), utils, env y la
  configuración de tooling (TS + Biome). `admin` escribe contenido y `web` lo lee, ambos vía
  `@ancla/content` (hoy datos seed; mañana respaldado por `@ancla/db`).
- **Local** (dentro de cada app): layouts/páginas/estilos de marca de `web`; rutas del dashboard,
  `components/ui` (shadcn) y tema de `admin`. **Los diseños se mantienen separados** — no hay
  `packages/ui` compartido.

Las referencias entre workspaces usan el protocolo `*` (`"@ancla/utils": "*"`), resuelto por Bun.

## Comandos

```bash
bun install          # instala todo el workspace
bun run dev          # turbo: levanta web + admin en paralelo
bun run build        # turbo: build de ambas apps (cacheado)
bun run lint         # turbo: lint por app
bun run check-types  # turbo: typecheck
bun run db:generate  # genera el cliente Prisma de @ancla/db
```

## Notas

- Gestor de paquetes: **Bun** (`packageManager: bun@1.2.4`).
- `web` consume `@ancla/*` vía alias de Vite en `apps/web/astro.config.mjs`.
- `admin` fija `turbopack.root` a la raíz del monorepo en `apps/admin/next.config.mjs`.
- Sanity fue **removido** de `web` y reemplazado por `@ancla/content` (CMS custom).
