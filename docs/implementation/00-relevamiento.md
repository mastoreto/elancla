# 00 — Relevamiento del estado actual (2026-11-18)

Foto del repo antes de empezar la implementación funcional. Es descriptivo: las decisiones viven en
[`decisions.md`](./decisions.md).

## Resumen ejecutivo

- **El CRM es una maqueta de alta fidelidad.** 42 páginas, todas con datos seed en `data/*.ts`.
  Ninguna página lee ni escribe en la BD. Lo único conectado es el login (Better Auth) y la barrera
  de sesión del layout.
- **La web ya funciona en SSR** (Astro `output: 'server'`, Vercel o Node standalone). Lee de la BD solo
  `SiteSettings` (por request, en el middleware). El resto del contenido sale de seeds
  (`packages/content`, `apps/web/src/data`) o de la API de YouTube (sermones, directo).
- **La BD es un scaffold.** Sirve para contenido básico y auth, pero tesorería, gobierno, RBAC,
  auditoría y multimedia no existen.

## Base de datos (`packages/db/prisma/schema.prisma`, 224 líneas)

| Área | Modelos | Estado |
|---|---|---|
| Contenido | `Author`, `Category`, `Series`, `Post` (body `Json`, tags `String[]`) | Usable como base; sin i18n, sin media, sin tenant |
| Sitio | `SiteSettings` (singleton), `SiteSettingsTranslation`, `ServiceTime` | Usado por la web |
| Tesorería | `Ministry`, `Movement` | Stubs: sin usuario, proyecto, cuenta, adjuntos ni motivo de edición |
| Auth | `User` (`role: String`), `Session`, `Account`, `Verification` | Core de Better Auth + rol plano |

Problemas detectados:

1. **Dinero en `Float`** (`Movement.amount`, `Ministry.budget`). Errores de redondeo en un sistema
   contable. Hay que pasar a `Decimal`.
2. **Sin migraciones.** Se usa `prisma db push` (también en `docker-compose`). No hay historial
   versionado del schema; inaceptable apenas haya datos reales.
3. **Rol como string libre** en `User`. No soporta varios roles, permisos finos ni alcance por
   ministerio.
4. **Sin columna de tenant** (iglesia/organización) en ningún modelo.
5. **Sin tablas de**: auditoría, archivos/multimedia, invitaciones, MFA, permisos, proyectos,
   presupuestos, solicitudes, boletas, comprobantes, cuentas/cajas, inventario, votaciones,
   informes, calendario, ministerios públicos, podcasts, galería.
6. IDs con `cuid()` (bien: no secuenciales, no adivinables).

## Auth (`packages/auth`)

- Better Auth con `emailAndPassword` habilitado. **Sin Google, sin invitaciones, sin MFA, sin rate
  limit configurado.** `signUp` está exportado en el cliente.
- Versiones desalineadas: `packages/auth` declara `better-auth ^1.6.18`, `apps/crm` fija `1.7.25`.
- Seed de admin por script (`seed-admin.ts`) con email/contraseña.
- Comentarios desactualizados que hablan de `apps/admin`.

## Seguridad en el CRM

- `apps/crm/middleware.ts`: guard optimista (solo mira la cookie) + rewrites de rutas en español
  (`/<slug-iglesia>/<ruta>`). En Next 16 la convención es `proxy.ts`; `middleware.ts` está deprecado.
- `app/(dashboard)/layout.tsx`: valida la sesión contra la BD. **No alcanza como barrera**: los
  layouts no se re-ejecutan en cada navegación y las Server Actions son endpoints públicos que no
  pasan por el layout. Hoy no hay autorización por permiso en ningún lado.
- `CRM_DEV_SKIP_AUTH` (bypass solo en `next dev`): correcto, conservar.
- **`/informe/[code]` es público** y la restricción geográfica (`LocationGate`, 300 m) se evalúa
  **solo en el cliente**. Cualquiera la saltea con las devtools (override de sensores) y los datos
  del informe no deberían viajar al navegador antes de validar.
- Sin cabeceras de seguridad (CSP, etc.) en el CRM. La web tiene algunas en `vercel.json`.

## RBAC modelado en la UI (mock)

`settings/data/permission-modules.ts` ya define una grilla **módulo × acción**:

- Módulos: `movements`, `requests`, `vouchers`, `projects`, `budgets`, `voting`, `reports`,
  `content`, `settings`.
- Acciones: `view`, `create`, `edit`, `approve`, `delete`.
- Presets: solo lectura, operativo, completo. Roles seed: Administrador, Tesorería, Líder, Lector.

Es un buen punto de partida para el modelo real. Falta: alcance (propio / ministerio / todo),
granularidad dentro de `content` (blog, sermones, calendario...) e `inventory`/`ministries`.

## Web (`apps/web`)

- Páginas: landing, blog, sermones, calendario anual (+ `.ics`), ministerios, visítanos, confesión
  de fe, páginas de contenido, `llms.txt`, sitemaps. Rutas localizadas `es/pt/en`.
- Datos: `src/data/calendar.ts` (seed, con nota “será reemplazado por el admin”), `blog.ts`,
  `contentPages.ts`, `doctrines.ts`, `youtube.ts` (API real con caché CDN).
- `packages/content` expone funciones async (`getAllPostCards`, `getPostBySlug`...) que devuelven
  seeds: **la firma ya está pensada para cambiar a BD sin tocar consumidores.**
- El middleware de Astro consulta `SiteSettings` en **cada request** sin caché.

## Infra y calidad

- `docker-compose`: Postgres 16 local, servicio `migrate` (db push + seed), CRM standalone, web.
- Web con `vercel.json`; destino de producción del CRM y de la BD: **no definido en el repo**.
- Tests: `bun:test` (p. ej. `lib/format-money.test.ts`, utils de `informe`). No hay script `test`
  en ningún `package.json` ni tarea en `turbo.json`. Sin tests de integración ni E2E.
- `packages/env` valida con t3-env pero casi todo es `optional()`.

## ESRE vs. sistema actual

El ESRE (`apps/crm/docs/esre.pdf`) cubre solo **tesorería** (RF-01 a RF-20). Lo que el ESRE pide y
todavía no está contemplado en BD:

| RF | Tema | Nota |
|---|---|---|
| RF-01 | Roles: Tesorero, Síndico, Directiva, Pastoral, Líder, Asamblea, Oficina + roles por proyecto | Proyecto editable por tesorería, directiva y su creador (permiso por propiedad) |
| RF-02 | Panel inicial distinto por rol | Saldos por ubicación del dinero (banco / caja fuerte / efectivo) |
| RF-04/05 | Movimientos: fecha pasada/futura, usuario, proyecto, concepto, moneda UYU/USD | La edición conserva la fecha de creación y **exige motivo** |
| RF-06 | Informes anual/semestral/trimestral/mensual/ministerial/moneda/proyecto/período | ESRE dice “no se almacenan, se descargan”: **choca** con el requisito nuevo de anti-filtración |
| RF-07/08 | Presupuesto anual por ministerio, modificable | |
| RF-09..13 | Solicitudes de dinero: estados, corte por quincena, derivación a directiva, notificaciones | Notificaciones por email y navegador |
| RF-14..19 | Boletas y comprobantes de caja con reglas de bloqueo | No editable/eliminable si justifica un movimiento |
| RF-20 | Proyectos: estados, documentos, **versionado de cambios**, cierre en vez de borrado | |
| 2.2 | Digitalización de facturas (foto, escaneo, PDF) | Requiere almacenamiento privado de archivos |

Lo que **no** está en el ESRE y sí se pide ahora: contenidos web, gobierno (votaciones, asamblea,
informes en sala), auditoría estricta, MFA, multitenant futuro, inventario.
