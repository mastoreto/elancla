# CLAUDE.md

Guía para Claude Code en este repositorio. Es de cumplimiento obligatorio.

## Idioma

- Conversación con el equipo: **español**.
- Código (funciones, variables, tipos, comentarios, commits): **inglés**.
- Contenido visible al usuario final: siempre vía i18n (`es`, `en`, `pt`), nunca hardcodeado.

## 1. Alcance del repositorio

Monorepo de **El Ancla** (iglesia). Gestor de paquetes **bun**, orquestación con **Turborepo**, lint/format con **Biome**.

| Workspace | Qué es | Stack |
|---|---|---|
| `apps/web` | Sitio público (landing, ministerios, blog, sermones, calendario, visítanos, SEO/AEO) | Astro 7 + islas React 19 + Tailwind v4 + CSS por sección |
| `apps/crm` | Gestión de tesorería (iEkklesia) | Next.js App Router + React 19 + shadcn/ui |
| `packages/db` | Prisma + acceso a datos | Prisma |
| `packages/auth` | Autenticación | — |
| `packages/content` | Contenido compartido | TS |
| `packages/env` | Validación de variables de entorno | TS |
| `packages/utils` | Utilidades puras compartidas entre apps | TS |
| `packages/typescript-config`, `packages/biome-config` | Configs compartidas | — |

Fuera de alcance: `video/` (assets de video, no es código de producto) y `dist/`, `.turbo/`, `.codegraph/`, `.impeccable/`.

### Comandos

```bash
bun install
bun run dev          # turbo: todas las apps
bun run build        # turbo build (web corre `astro check` antes)
bun run check        # biome check --write
bun run check-types
bun run db:generate | db:push | db:migrate | db:reset
```

Después de editar: `bun run check` y `bun run check-types`. No dejes el repo con errores de tipos aunque `apps/crm` tenga `ignoreBuildErrors`.

### Decisiones de producto/diseño (no reabrir sin pedirlo)

- Dirección visual: **cálida, cercana, inmersiva**; paleta B; formas suaves; no extraer colores de fotos.
- Fuentes de marca definidas en el diseño; no introducir otras.
- Son **9 doctrinas**; las fotos con caras se conservan.
- **Logo**: el wordmark es idéntico en todo lugar y se renderiza **solo** con `LogoText.astro`. Nunca reescribirlo a mano.

## 2. Estructura de carpetas

### Regla madre

> **Todo vive dentro de una carpeta.** Las únicas excepciones son archivos *principales* (entrypoints) y *barrels* (`index.ts`).

- Un componente = una carpeta con su nombre: `Hero/Hero.astro`.
- Si un archivo consume varios componentes/utils/tipos, esos viven en subcarpetas **de su propio dueño** (section, feature o page), no en una carpeta global.
- **Alcance mínimo**: algo se usa en un solo lugar → vive junto a ese lugar. Se usa en 2+ features → sube a la carpeta global de `src/`. Se usa en 2+ apps → sube a `packages/`.
- Cada carpeta expone su API pública con un `index.ts` (barrel). Se importa desde el barrel, nunca desde archivos internos de otra carpeta.
- Un archivo = una responsabilidad. Nombres de carpeta: `PascalCase` para componentes, `camelCase`/`kebab-case` en minúscula para el resto (`utils`, `types`, `lib`).

### Plantilla de una unidad (section / feature / page)

```
Hero/                      # ← la unidad
├── Hero.astro             # archivo principal (entrypoint)
├── index.ts               # barrel
├── components/            # solo componentes que Hero consume
│   └── HeroCta/
│       ├── HeroCta.astro
│       └── index.ts
├── utils/                 # helpers exclusivos de Hero
│   └── buildHeroLinks/
│       ├── buildHeroLinks.ts
│       ├── buildHeroLinks.test.ts
│       └── index.ts
├── types/                 # tipos e interfaces exclusivos de Hero
│   └── index.ts
├── hooks/                 # (React) hooks exclusivos
├── lib/                   # integraciones/clientes exclusivos
├── data/                  # datos estáticos exclusivos
├── styles/                # CSS exclusivo
└── scripts/               # JS de cliente exclusivo
```

Crea solo las subcarpetas que hagan falta; no scaffolds vacíos.

### `apps/web/src` (objetivo)

```
src/
├── components/     # compartidos globales (ui/, LogoText/, Footer/, Header/...)
│   └── ui/         # primitivas (Button, Pill, Card) cada una en su carpeta
├── sections/       # secciones de página; cada una con su carpeta de componentes
│   └── landing/Hero/, Together/, Doctrines/ ...
├── features/       # (si aparece) lógica de dominio: blog, sermons, calendar
├── layouts/        # Layout/Layout.astro + index.ts
├── pages/          # solo routing delgado: compone secciones, no contiene lógica
├── i18n/           # config, messages/{es,en,pt}/, utils
├── data/           # datos globales
├── stores/         # estado global (nanostores/slices)
├── scripts/        # JS de cliente global
├── styles/         # tokens y estilos globales
├── utils/          # utilidades globales, cada una en su carpeta
├── types/          # tipos globales
├── lib/            # integraciones globales (seo, youtube, llms)
└── middleware.ts   # archivo principal permitido suelto
```

### `apps/crm` (Next.js)

```
app/(dashboard)/<route>/
├── page.tsx                # archivo principal; delgado
├── components/             # componentes exclusivos de la ruta
├── hooks/  utils/  types/  lib/
components/ui/              # shadcn/ui (no tocar salvo vía CLI)
components/<feature>/       # componentes compartidos por feature
hooks/  lib/  types/        # globales
```

Hay un `src/componentes/` heredado en español junto a `components/`: **no crear más ahí**; migrar al mover código.

### Archivos principales permitidos sueltos

`page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`, `*.config.*`, `env.d.ts`, `index.ts` (barrel) y entrypoints de Astro en `pages/`.

## 3. Principios generales (Clean Code + SOLID)

**Clean Code**
- Nombres que revelan intención; sin abreviaturas crípticas. Funciones que hacen **una cosa**, cortas (≈ ≤ 30 líneas), ≤ 3 parámetros (si no, objeto).
- Sin números/strings mágicos: constantes con nombre.
- Early return en vez de `if` anidados. Sin código muerto ni comentarios que repiten el código; comenta el **porqué**.
- DRY con criterio: abstrae a la 3.ª repetición, no antes (regla de tres). No abstracciones especulativas (YAGNI).
- Funciones puras donde se pueda; efectos secundarios aislados en bordes (`lib/`, hooks, scripts).
- Errores explícitos en los bordes de confianza (input de usuario, red, env). No tragar excepciones.
- TypeScript `strict`; prohibido `any` (usa `unknown` + narrowing); tipos de retorno explícitos en funciones exportadas.

**SOLID aplicado**
- **S** — Un componente/módulo, una razón para cambiar. Datos, lógica y presentación separados (`data/`, `utils/`, componente).
- **O** — Extiende por props/slots/composición/variantes, no editando el componente base con `if` por caso.
- **L** — Un componente que reemplaza a otro respeta el mismo contrato de props (`ComponentProps<'button'>` y sus extensiones).
- **I** — Props mínimas y específicas; no pases objetos enormes si usas 2 campos.
- **D** — Depende de abstracciones (tipos/props), no de implementaciones concretas; inyecta datos y clientes vía props o parámetros, no los importes dentro del componente de UI.

## 4. Componentización (siempre)

1. Antes de escribir markup nuevo, **busca** si existe un componente (`components/ui`, `LogoText`, `Button`, `Pill`, `Card`...) y reúsalo.
2. Si un bloque se repite, tiene estado propio, o supera ~80–100 líneas, **extráelo** a su carpeta.
3. Componentes **presentacionales** (reciben props, no saben de dónde vienen los datos) vs. **contenedores** (obtienen/transforman datos y componen). Page → Section → Component → ui primitive.
4. Composición sobre configuración: usa `children`/slots antes que un componente con 15 props booleanas.
5. Variantes con un mapa tipado (o `cva`) + `cn()`; nada de concatenar clases con strings.
6. Los textos entran por props o por i18n; el componente no conoce el idioma.
7. Estilos junto al componente cuando son exclusivos; tokens y utilidades globales en `styles/`.

## 5. Buenas prácticas — Astro (`apps/web`)

- **Cero JS por defecto.** Todo es `.astro` (HTML estático) salvo que haya interactividad real. Antes de una isla React, pregúntate si CSS o un `<script>` pequeño basta.
- **Islas con la directiva más perezosa posible**: `client:visible` > `client:idle` > `client:load`. `client:only` solo si no puede renderizar en servidor. Nunca `client:load` por costumbre.
- Frontmatter: tipa siempre `Props` (`interface Props`) y desestructura con `Astro.props`. Lógica pesada va a `utils/`, no al frontmatter.
- **Content/data**: usa Content Collections o `data/` tipado; valida con Zod en el borde.
- **i18n**: toda cadena en `i18n/messages/{es,en,pt}/`. Al agregar una clave, agrégala en los **tres** idiomas en la misma PR. Rutas localizadas vía `[locale]`.
- **Imágenes**: `astro:assets` (`<Image>`/`<Picture>`), `width`/`height` o `aspect-ratio` para evitar CLS, `loading="lazy"` salvo el LCP (`fetchpriority="high"`). Siempre `alt` significativo (decorativas: `alt=""`).
- **Fuentes**: precarga solo las críticas, `font-display: swap`, subset.
- **Scripts de cliente**: en `scripts/` de la unidad, importados con `<script>` de Astro (se bundlean y deduplican). Sin `is:inline` salvo necesidad (theme flash, analytics). Limpia listeners; respeta `astro:page-load` si hay View Transitions.
- **Estilos**: Tailwind para layout/utilidades; CSS de sección para composición compleja. Tokens (color, espaciado, tipografía) como variables CSS en `styles/`; nada de colores literales sueltos.
- **Animaciones**: `prefers-reduced-motion` obligatorio; anima solo `transform`/`opacity`; GSAP/Lenis/Motion se importan dinámicamente donde se usan, no globalmente.
- **SEO/AEO**: cada página define title, description, canonical, hreflang, OG y JSON-LD vía `utils/seo` / `astro-seo`. Mantén `llms.txt`, sitemap e índices al día al crear páginas.
- **Accesibilidad**: HTML semántico (`header/nav/main/section/article`), un solo `h1`, jerarquía de headings, foco visible, contraste AA, navegación por teclado, `aria-*` solo cuando el HTML nativo no alcanza.
- **Rendimiento**: `astro check` limpio, sin dependencias nuevas sin justificar el peso. Prefiere API nativa a librerías.
- `pages/` solo enruta y compone; no contiene lógica de negocio ni estilos extensos.

## 6. Buenas prácticas — React / Next.js

**React 19**
- Componentes de función pequeños y puros. Sin lógica de negocio en JSX: extrae a hooks (`use*`) o `utils/`.
- **Server Components por defecto** (Next App Router); `'use client'` solo en hojas que necesitan estado, efectos o eventos. Empújalo lo más abajo posible del árbol.
- No uses `useEffect` para derivar estado ni para fetch en cliente cuando se pueda hacer en servidor. Estado derivado se calcula en render; `useMemo`/`useCallback` solo con evidencia de coste.
- Keys estables (nunca el índice si la lista cambia). Estado local primero, luego lift-up, luego store; no global por defecto.
- Formularios: Server Actions / `useActionState`; valida con Zod en cliente **y** servidor.
- Props tipadas con `interface`; evita `React.FC`; no `prop-types` (TS ya lo cubre).

**Next.js (crm)**
- Rutas delgadas (`page.tsx`/`layout.tsx`) que componen componentes de su carpeta.
- Fetch de datos en Server Components; `loading.tsx`/`error.tsx`/`not-found.tsx` por segmento; `Suspense` para streaming.
- `next/image`, `next/font`, `metadata` API. Cachea explícitamente; no asumas defaults.
- Seguridad: valida entrada en cada Server Action/route handler, autoriza en el servidor (no confíes en la UI), nunca expongas secretos al cliente (solo `NEXT_PUBLIC_*` intencional), variables validadas con `packages/env`.
- shadcn/ui: añade primitivas vía CLI en `components/ui/`; no las edites para casos puntuales: envuélvelas en un componente de feature.
- Alias `@/*`; imports absolutos, nunca `../../../`.

## 7. TypeScript, estilo y calidad

- Formato/lint: **Biome** (no ESLint/Prettier en código nuevo). 2 espacios, ancho 100, LF.
- `type` para uniones/utilidades, `interface` para formas de objetos/props. Tipos compartidos en `types/`; sin tipos duplicados.
- Imports ordenados (lo hace Biome); un barrel por carpeta; sin dependencias circulares.
- Nada de `console.log` ni `TODO` sin dueño en commits.
- Tests: toda lógica no trivial en `utils/` o `lib/` lleva su test junto al archivo (`*.test.ts`) dentro de su carpeta.
- Dependencias: antes de añadir una, verifica stdlib/plataforma/dep ya instalada. Versiones fijas en workspaces; un solo gestor (`bun`), un solo lockfile.
- Secretos: nunca en el repo. `.env` fuera de git; documenta toda variable nueva en `.env.example` y valídala en `packages/env`.

## 8. Git

- Rama desde `main` con prefijo `feat/`, `fix/`, `refactor/`, `chore/`. PR hacia `main`.
- Commits en inglés, estilo Conventional Commits con scope: `refactor(web): rebuild the 404 page on the "obra" design`.
- **Jamás** añadir `Co-Authored-By` ni "Generated with Claude Code" en commits o PRs.
- No commitear ni hacer push sin que se pida. Un cambio lógico por commit.

## 9. Checklist antes de dar algo por terminado

- [ ] ¿Cada archivo nuevo está dentro de su carpeta, con barrel, y en el alcance correcto (local vs. global)?
- [ ] ¿Reutilicé componentes existentes y extraje lo repetido?
- [ ] ¿Textos en los tres idiomas? ¿Logo con `LogoText`?
- [ ] ¿Sin `any`, sin JS de cliente innecesario, directiva de isla mínima?
- [ ] ¿Accesibilidad, `alt`, reduced-motion y responsive (móvil primero) revisados?
- [ ] `bun run check` y `bun run check-types` limpios; build de la app tocada pasa.
