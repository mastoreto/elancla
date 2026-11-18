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
| `apps/web` | Sitio público (landing, ministerios, blog, sermones, calendario, visítanos, SEO/AEO) | Astro 7 + islas React 19 + Tailwind v4 |
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
├── styles/         # tokens + CSS de animaciones/casos que Tailwind no cubre (ver sección 5)
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

Los componentes compartidos del dashboard viven en `components/dashboard/` (el antiguo `src/componentes/` ya no existe); DataTable y RichTextEditor ya viven en `components/`.

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
5. Estilos y variantes: siempre con el mapa `styles` + `cn()` (ver sección 5). Nada de concatenar clases con strings.
6. Los textos entran por props o por i18n; el componente no conoce el idioma.
7. Los estilos viven **dentro del componente** (mapa `styles`); solo animaciones y CSS que Tailwind no soporta van a `src/styles/` global.
8. **Convención de estilos Tailwind (obligatoria, `apps/crm` y toda app React)**: prohibido el `className="..."` con strings largos inline en JSX. Cada componente/sección declara **un** objeto `<nombreComponente><Seccion>Page` con una clave por elemento, cada valor envuelto en `cn()`, y la clave raíz recibe la prop `className`:

   ```tsx
   const ministryCardMinistriesPage = {
     container: cn("flex flex-col gap-4 rounded-xl border bg-card p-5", className),
     name: cn("font-display text-lg font-medium"),
   };
   // <article className={ministryCardMinistriesPage.container}>
   ```

   - Páginas sin prop `className`: el objeto va a nivel de módulo (`const ministriesPage = {...}`).
   - Variantes por estado: mapa de módulo `satisfies Record<...>` que se combina dentro del objeto con `cn()`.
   - Solo se permite `className` inline para una utilidad suelta de 1–2 clases cuando no justifica una clave; nunca strings largos.
   - `components/ui/` (shadcn) conserva `cva`; no se reescribe a mano.
   - Al crear o tocar un componente, conviértelo a esta convención en el mismo cambio. Detalle: `apps/crm/docs/migration/styles-convention.md`.
   - Se verifica con el plugin de Biome `apps/crm/biome-plugins/no-long-inline-classname.grit` (`bun run check`): marca como *error* los `className` con strings de más de 40 caracteres (también dentro de `cn(...)`). Es *error* desde que terminó la migración de las secciones.

## 5. Estilos con Tailwind (apps/web y apps/crm)

**Regla: todo estilo se escribe con Tailwind y se construye con `cn()` dentro de un mapa `styles` por componente.** Sin `class="..."` largos inline en el markup, sin CSS por sección, sin `style=""` salvo valores realmente dinámicos (CSS variables).

### Patrón obligatorio

Un objeto con el nombre del componente/sección/page en `camelCase` + `Styles`; cada clave es el rol del elemento y su valor un `cn(...)`:

```ts
import { cn } from '@ancla/utils';

const heroStyles = {
  container: cn('relative isolate grid min-h-svh place-items-center px-6 py-24'),
  card: cn('rounded-3xl bg-surface p-8 shadow-lg', 'md:p-12'),
  title: cn('font-display text-4xl text-balance md:text-6xl'),
  cta: cn('inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium'),
};
```

Uso: `<section class={heroStyles.container}>` (Astro) / `className={heroStyles.container}` (React).

- Un argumento de `cn` por grupo lógico (layout, tipografía, color, estados, breakpoints) para que se lea y se revise bien.
- Clases condicionales/variantes dentro del mismo mapa; las variantes con parámetros usan un sub-mapa tipado o una función:

```ts
const buttonStyles = {
  base: cn('inline-flex items-center rounded-full font-medium transition-colors'),
  variant: {
    primary: cn('bg-brand text-white hover:bg-brand/90'),
    ghost: cn('bg-transparent text-brand hover:bg-brand/10'),
  },
  size: { sm: cn('px-4 py-2 text-sm'), md: cn('px-6 py-3 text-base') },
} satisfies Record<string, unknown>;

class={cn(buttonStyles.base, buttonStyles.variant[variant], buttonStyles.size[size], className)}
```

- Componentes que aceptan `class`/`className` lo reciben como **último** argumento de `cn` para que el llamador pueda sobrescribir.
- El mapa vive en el mismo archivo si es corto; si crece (> ~40 líneas) pasa a `styles.ts` dentro de la carpeta del componente y se exporta por el barrel.
- `cn` se importa **siempre** de `@ancla/utils` (en web, `utils/cn` es solo un re-export legacy; no usarlo en código nuevo).
- Tokens de diseño (colores, fuentes, radios, espaciado) en el `@theme` de Tailwind; nada de valores arbitrarios (`w-[137px]`, `text-[#ff2e34]`) si existe un token.
- Prohibido `@apply`, salvo en `src/styles/` global para los casos de abajo.

### Excepción: CSS en `src/styles/` global

Solo se permite CSS propio cuando Tailwind **no lo soporta o resulta ilegible**:

- Animaciones y keyframes complejos, transiciones de página (`PageTransitions`, `ThemeTransition`), scroll-driven animations, view transitions.
- Pseudo-elementos/selectores complejos, `@property`, `mask`/`clip-path` elaborados, estilos de impresión (`CalendarPrint`).

Reglas de la excepción: un archivo `.css` **específico por caso** (`PageTransitions.css`, no un `misc.css`), en `src/styles/` de la app, importado desde el componente que lo usa; clases con nombre semántico y prefijadas; comentario del porqué Tailwind no alcanza; siempre con `prefers-reduced-motion`.

### Refactor de código existente

Si tocas un componente o página que **no** sigue este patrón (CSS por sección, clases largas inline, concatenación de strings), **refactorízalo al patrón en el mismo cambio**: migra a Tailwind + mapa `styles`, borra el CSS que quede huérfano y verifica visualmente que no haya regresiones (responsive, dark mode, hover/focus). Lo único que se conserva en `.css` es lo de la excepción anterior.

## 6. Buenas prácticas — Astro (`apps/web`)

- **Cero JS por defecto.** Todo es `.astro` (HTML estático) salvo que haya interactividad real. Antes de una isla React, pregúntate si CSS o un `<script>` pequeño basta.
- **Islas con la directiva más perezosa posible**: `client:visible` > `client:idle` > `client:load`. `client:only` solo si no puede renderizar en servidor. Nunca `client:load` por costumbre.
- Frontmatter: tipa siempre `Props` (`interface Props`) y desestructura con `Astro.props`. Lógica pesada va a `utils/`, no al frontmatter.
- **Content/data**: usa Content Collections o `data/` tipado; valida con Zod en el borde.
- **i18n**: toda cadena en `i18n/messages/{es,en,pt}/`. Al agregar una clave, agrégala en los **tres** idiomas en la misma PR. Rutas localizadas vía `[locale]`.
- **Imágenes**: `astro:assets` (`<Image>`/`<Picture>`), `width`/`height` o `aspect-ratio` para evitar CLS, `loading="lazy"` salvo el LCP (`fetchpriority="high"`). Siempre `alt` significativo (decorativas: `alt=""`).
- **Fuentes**: precarga solo las críticas, `font-display: swap`, subset.
- **Scripts de cliente**: en `scripts/` de la unidad, importados con `<script>` de Astro (se bundlean y deduplican). Sin `is:inline` salvo necesidad (theme flash, analytics). Limpia listeners; respeta `astro:page-load` si hay View Transitions.
- **Estilos**: ver sección 5 (Tailwind + mapa `styles`). Tokens (color, espaciado, tipografía) como variables CSS/`@theme` en `src/styles/`; nada de colores literales sueltos.
- **Animaciones**: `prefers-reduced-motion` obligatorio; anima solo `transform`/`opacity`; GSAP/Lenis/Motion se importan dinámicamente donde se usan, no globalmente.
- **SEO/AEO**: cada página define title, description, canonical, hreflang, OG y JSON-LD vía `utils/seo` / `astro-seo`. Mantén `llms.txt`, sitemap e índices al día al crear páginas.
- **Accesibilidad**: HTML semántico (`header/nav/main/section/article`), un solo `h1`, jerarquía de headings, foco visible, contraste AA, navegación por teclado, `aria-*` solo cuando el HTML nativo no alcanza.
- **Rendimiento**: `astro check` limpio, sin dependencias nuevas sin justificar el peso. Prefiere API nativa a librerías.
- `pages/` solo enruta y compone; no contiene lógica de negocio ni estilos extensos.

## 7. Buenas prácticas — React / Next.js

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

## 8. TypeScript, estilo y calidad

- Formato/lint: **Biome** (no ESLint/Prettier en código nuevo). 2 espacios, ancho 100, LF.
- `type` para uniones/utilidades, `interface` para formas de objetos/props. Tipos compartidos en `types/`; sin tipos duplicados.
- Imports ordenados (lo hace Biome); un barrel por carpeta; sin dependencias circulares.
- Nada de `console.log` ni `TODO` sin dueño en commits.
- Tests: toda lógica no trivial en `utils/` o `lib/` lleva su test junto al archivo (`*.test.ts`) dentro de su carpeta.
- Dependencias: antes de añadir una, verifica stdlib/plataforma/dep ya instalada. Versiones fijas en workspaces; un solo gestor (`bun`), un solo lockfile.
- Secretos: nunca en el repo. `.env` fuera de git; documenta toda variable nueva en `.env.example` y valídala en `packages/env`.

## 9. Git

- Toda rama de trabajo sale de **`develop`** con prefijo `feat/`, `fix/`, `refactor/`, `chore/`, y su PR va hacia `develop`.
- **`main` jamás se toca directamente**: solo recibe un PR `develop → main`, que se aprueba manualmente.
- Commits en inglés, estilo Conventional Commits con scope: `refactor(web): rebuild the 404 page on the "obra" design`.
- **Jamás** añadir `Co-Authored-By` ni "Generated with Claude Code" en commits o PRs.
- No commitear ni hacer push sin que se pida. Un cambio lógico por commit.

## 10. Checklist antes de dar algo por terminado

- [ ] ¿Cada archivo nuevo está dentro de su carpeta, con barrel, y en el alcance correcto (local vs. global)?
- [ ] ¿Reutilicé componentes existentes y extraje lo repetido?
- [ ] ¿Estilos en Tailwind con el mapa `styles` + `cn()`? ¿CSS propio solo para animaciones/casos no soportados?
- [ ] ¿Textos en los tres idiomas? ¿Logo con `LogoText`?
- [ ] ¿Sin `any`, sin JS de cliente innecesario, directiva de isla mínima?
- [ ] ¿Accesibilidad, `alt`, reduced-motion y responsive (móvil primero) revisados?
- [ ] `bun run check` y `bun run check-types` limpios; build de la app tocada pasa.
