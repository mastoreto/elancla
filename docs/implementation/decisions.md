# Registro de decisiones

Una entrada por decisión. Estados: **propuesta** (en discusión), **aceptada**, **descartada**,
**reemplazada por D-xx**. Una decisión aceptada no se reabre sin pedirlo explícitamente.

Al aceptarse, la decisión se desarrolla en el archivo de `architecture/` que corresponda y acá queda
el resumen con el enlace.

| ID | Tema | Estado |
|---|---|---|
| D-01 | ~~Paquete de dominio en `packages/core`~~ | reemplazada por D-13 |
| D-02 | Multitenant: columna de tenant ahora, multitenant real después del lanzamiento | aceptada |
| D-03 | Identificadores: UUIDv7 + slugs + códigos legibles | aceptada |
| D-04 | Dinero en `Decimal` y registros contables inmutables | aceptada |
| D-05 | Migraciones versionadas (`prisma migrate`) | aceptada |
| D-06 | Archivos: Backblaze B2 + CDN de Cloudflare | aceptada |
| D-07 | Autorización en la capa de servicios; `proxy.ts` solo optimista | aceptada |
| D-08 | Auth: Google y email/contraseña, ambos solo por invitación + MFA opcional para todos | aceptada (implementada en 0.3) |
| D-09 | RBAC: permisos módulo × acción + alcance | aceptada |
| D-10 | Auditoría append-only en la misma transacción | aceptada |
| D-11 | Informes de tesorería para presentar: acceso sin usuario, geocerca en servidor, modalidad virtual | aceptada |
| D-12 | Estrategia de tests | aceptada |
| D-13 | ~~Backend con Server Actions dentro de `apps/crm`~~ | reemplazada por D-24 |
| D-14 | Hosting: Vercel (web y CRM) | aceptada |
| D-15 | ~~Contenido editable solo en español~~ | reemplazada por D-26 |
| D-16 | Política de sesión configurable por rol | aceptada |
| D-17 | Descarga de cualquier informe solo con autorización, registrando qué se extrajo | aceptada |
| D-18 | Monedas por organización, siempre por separado, sin conversión | aceptada (ampliada por D-51) |
| D-19 | Capturas de pantalla: disuasión y trazabilidad; detección custom a investigar | aceptada |
| D-20 | Ministerio: una tabla, dos secciones con permisos separados | aceptada |
| D-21 | Base de datos: Supabase Postgres vía Prisma | aceptada |
| D-22 | Caché y fluidez | aceptada (ajustada por D-24) |
| D-23 | ~~Comandos/consultas acoplados a Server Actions~~ | descartada |
| D-24 | Backend API-first: `apps/api` con Hono, capas controller → service → data | aceptada |
| D-25 | Multi-sitio: cada iglesia (tenant) tiene su sitio; API pública versionada con site keys | aceptada |
| D-26 | Todo contenido editable es traducible | aceptada (modelo propuesto) |
| D-27 | Horarios: conjuntos alternables (p. ej. verano) y horarios especiales | aceptada (modelo ajustado por D-31) |
| D-28 | Landing: fijo vs. editable | aceptada |
| D-29 | Ministerio: página de estructura fija, horarios desde el calendario | aceptada |
| D-30 | Flujo editorial: revisión opcional u obligatoria por autor/rol, revisores configurables | aceptada (modelo propuesto) |
| D-31 | Calendario: actividades recurrentes unificadas, año con borrador, eventos internos, cambio de año | aceptada |
| D-32 | Blog: bloques del diseño en Tiptap, visitas anónimas, sin comentarios ni reacciones | aceptada |
| D-33 | Estado por sección del sitio: activa, mantenimiento, fuera de servicio | aceptada |
| D-34 | Newsletter con doble opt-in, envío manual | aceptada |
| D-35 | Sermones: alta manual por ID de YouTube, series propias o importadas | aceptada |
| D-36 | Podcasts: programas con episodios enlazados a plataformas externas | aceptada |
| D-37 | Galería diferida: fuera de la primera versión | aceptada |
| D-38 | Visítanos: fijo + indicaciones y FAQ editables, horarios y dirección derivados | aceptada |
| D-39 | Nosotros: todo fijo salvo el equipo | aceptada |
| D-40 | Perfil público de persona único con visibilidad por contexto | aceptada |
| D-41 | Páginas simples editables (privacidad y similares) | aceptada |
| D-42 | Tesorería: circuito solicitud → orden de compra → egreso → rendición → cierre | aceptada |
| D-43 | Cuentas por moneda y transferencias entre cuentas | aceptada |
| D-44 | Rubros; ofrendas anónimas designadas con comentario confidencial | aceptada |
| D-45 | Solicitudes: anticipación mínima por monto y topes de aprobación fuera de presupuesto | aceptada |
| D-46 | Cierre mensual de período | aceptada |
| D-47 | Conciliación bancaria con importación de extractos | aceptada |
| D-48 | Presupuestos anuales por ministerio y proyecto, evaluados mes a mes | aceptada |
| D-49 | Fondos: dónde está el dinero (cuenta) y de quién es (fondo) | aceptada |
| D-50 | Seguimiento confidencial de aportantes en ofrendas especiales | aceptada |
| D-51 | Preparado para varios países: monedas, bancos y formatos de extracto configurables | aceptada |
| D-52 | Sin envío de informes por email (se depreca ESRE 2.1.4 para informes) | aceptada |
| D-53 | Gobierno: bases de padrón, acreditación y votaciones (implementación posterior) | aceptada (bases) |
| D-54 | Acta de asamblea: redacción en vivo con guardado automático y offline, o carga de archivo | aceptada |
| D-55 | Versionado: SemVer único del monorepo con commit-and-tag-version | aceptada |

---

## D-01 — Paquete de dominio (reemplazada)

Se descartó poner el backend en `packages/`: duplica lo que da el framework. Ver D-13.

## D-02 — Multitenant

**Aceptada.** Tabla `Organization` y `organizationId` en todo modelo de dominio desde la primera
migración, con una sola fila (El Ancla). Los servicios filtran siempre por el tenant del contexto.
El multitenant real (alta de iglesias, dominios, aislamiento con RLS) se hace **después** de que el
sistema esté 100 % operativo en El Ancla.

## D-03 — Identificadores

**Aceptada.**

- **PK**: UUIDv7 (`@id @default(uuid(7)) @db.Uuid`) en todo modelo de dominio. Ordenable por tiempo
  (índices sanos), no adivinable, sirve igual con multitenant.
- **Código legible** en entidades contables (`MOV-2026-000123`, `BOL-…`, `SOL-…`): clave alternativa
  con `@@unique([organizationId, code])`. No reemplaza a la PK ni se usa en relaciones; es la
  referencia que se escribe en papel y en el registro físico.
- El correlativo sale de una tabla `DocumentSequence (organizationId, type, year, last)` que se
  incrementa con `UPDATE … RETURNING` dentro de la misma transacción del alta: sin huecos y sin
  carreras. Las secuencias de Postgres no sirven porque dejan huecos al hacer rollback.
- **Contenido público**: `slug` con `@@unique([organizationId, slug])`.
- **Tablas de Better Auth**: se configura `generateId` para que también usen UUID.

## D-04 — Dinero

**Aceptada.** `Decimal(14,2)` + moneda por registro. En el código, el monto viaja como string
decimal o centavos enteros hasta la UI (el `Decimal` de Prisma no es serializable a Client
Components). Los movimientos no se borran ni se editan destructivamente: la edición guarda versión
anterior y motivo (RF-05); la anulación es un contra-asiento que referencia al original.

## D-05 — Migraciones

**Aceptada.** `prisma migrate` desde el rework del schema; `db push` queda prohibido fuera de
prototipos locales. Las migraciones se aplican en el deploy con `migrate deploy`. Evaluar Prisma 7 en
el mismo paso, antes de que haya datos.

## D-06 — Archivos y multimedia

**Aceptada.** Backblaze B2 (más barato por TB que R2 a futuro) detrás del CDN de Cloudflare
(el tráfico B2 → Cloudflare no se cobra). Dos buckets:

- **Público** (imágenes de contenido): servido por un subdominio (`media.<dominio>`) proxeado por
  Cloudflare con caché larga e inmutable (nombre de archivo con hash). Variantes `webp`/`avif` en
  varios anchos generadas al subir, sin transformaciones pagas.
- **Privado** (facturas, documentos): nunca pasa por el CDN; acceso solo por URL firmada de vida
  corta, emitida después de autorizar y auditar.

Subida directa desde el navegador con URL prefirmada (las funciones de Vercel limitan el cuerpo a
~4,5 MB). El servidor verifica tamaño y tipo real y registra el archivo en una tabla `File`.
Requisito: el DNS del dominio tiene que estar en Cloudflare.

**Detalles fijados al implementar la 0.6** (plan: [`plans/0.6-storage.md`](./plans/0.6-storage.md)):

- **Cuarentena**: toda subida entra al bucket privado y nada sin verificar llega nunca a
  `media.<dominio>`. Las variantes se generan en `finalize`; el original queda privado.
- **Propósitos en vez de `media:*`**: `MEDIA_PURPOSES` (contratos) decide bucket, tipos, tamaño máximo y
  permisos (`contentImage` con `content:create`; `voucherDocument` con `vouchers:create`/`view`). No hay
  recurso `media` en el catálogo: sería una segunda llave para la misma puerta.
- **`MediaFile`** (tabla `media_files`), no `File`: el tipo generado por Prisma taparía el `File` global
  que usa el código de subida. El bucket no se guarda: se deriva del propósito.
- **Claves con `fileId`** (UUIDv7, nunca reutilizado, contenido inmutable) en lugar de un hash:
  cumplen el caché inmutable sin calcular un hash en la clave.
- Un solo adaptador S3-compatible (`aws4fetch`); en local un servidor S3 en `docker-compose`
  (SeaweedFS: la edición comunitaria de MinIO dejó de publicar imágenes).

## D-07 — Dónde se controla la seguridad

**Aceptada.** `proxy.ts` (reemplaza `middleware.ts` en Next 16) solo hace redirect sin cookie,
rewrites y cabeceras. La barrera real está en los comandos y consultas (D-23): toda operación exige
contexto con sesión válida y permiso. Server Components filtran menú y vistas con el mismo chequeo,
pero nunca son la única barrera.

## D-08 — Auth

**Aceptada, implementada en 0.3.** Better Auth con **dos métodos: Google y email/contraseña**, ambos
**solo por invitación** (hook `databaseHooks.user.create.before`, puerta única de alta; el endpoint
público `sign-up/email` responde 404). Quien entra por un método puede habilitar el otro desde "Mi
cuenta": el vínculo es **solo explícito** (`disableImplicitLinking`, mismo email), nunca por
coincidencia de email al iniciar sesión. Con Google se guarda la foto de perfil (`user.image`).
`twoFactor` (TOTP + códigos de respaldo) **opcional para todos** y aplica a los dos métodos: el plugin
oficial solo intercepta login por credencial, por eso un plugin propio (`socialTwoFactorGuard`) cierra
el login social. Contraseña mínima de 12 caracteres; rate limit con almacenamiento en BD; sesión de 30
días con `freshAge` de 10 min para operaciones sensibles.

## D-09 — RBAC

**Aceptada.** Permiso = `recurso:acción` con alcance `own | ministry | all`. Roles editables en BD
(grilla de Configuración), varios roles por usuario (unión de permisos). El menú se arma desde los
permisos efectivos; lo que no está cubierto no se renderiza ni se consulta. Los recursos son finos
(p. ej. `ministries.profile` y `ministries.finance` por separado, ver D-20).

*Implementación (0.4):* el alcance se elige **por celda** de la grilla (cada acción concedida
tiene el suyo, limitado a los alcances que el recurso soporta). El rol `admin` es de sistema y tiene
**todos** los permisos de forma implícita, sin filas en `RolePermission`, de modo que cubre también
los recursos que se agreguen después; no se edita ni se borra.

## D-10 — Auditoría

**Aceptada.** Tabla `AuditLog` append-only (actor, tenant, acción, entidad, antes/después, motivo,
IP, user agent, request id, resultado), escrita en la misma transacción que la mutación. También se
registran lecturas sensibles (informes, documentos privados, exportaciones), logins, fallos de auth y
denegaciones. La app se conecta con un rol de Postgres propio sin `UPDATE`/`DELETE` sobre la tabla;
las migraciones usan otro rol.

Detalles fijados al implementar la 0.5:

- `actorId` **sin FK** + `actorLabel` (email o `cli`): el registro sobrevive al borrado del usuario.
  `organizationId` con `ON DELETE RESTRICT` (un cascade borraría el log).
- **Mutaciones: auditoría estricta** en la misma transacción. **Denegaciones y eventos de auth:
  best-effort** (un log caído no cambia la respuesta ni rompe un login ya hecho).
- Las denegaciones se registran en el `errorHandler` (todo `ForbiddenError`), no en cada guard.
- Inmutabilidad por privilegio (`REVOKE UPDATE, DELETE, TRUNCATE`) y policies solo `SELECT`/`INSERT`.
- Pendiente: encadenado de hashes (solo si los síndicos necesitan verificar integridad) y política de
  retención/supresión de datos personales del log.

## D-11 — Informes para presentar

**Aceptada.** Los informes son de tesorería y se generan con uno de dos propósitos:

- **Uso interno**: se ven en el CRM con permisos (D-17 para descargas).
- **Para presentar** (asamblea): tienen toda la configuración de publicación.

Quien ve un informe para presentar **no necesita ser usuario**. Requisitos:

- Código de alta entropía, ventana de vigencia, habilitación manual y baja automática.
- **Presencial**: geocerca validada **en el servidor**; el navegador manda coordenadas y recién
  entonces recibe los datos (hoy el informe viaja dentro de la página antes de validar). Se acepta
  el riesgo de GPS falseado.
- **Virtual**: sin geocerca; acceso solo con la credencial de asistente entregada al acreditarse
  (D-53).
- Modo proyección en la pantalla del salón.
- El informe se oculta al perder foco o visibilidad y se vuelve a mostrar al regresar.
- Marca de agua y bloqueo de impresión, selección y descarga (D-19).
- Cada apertura y cada rechazo quedan auditados (código, hora, distancia, user agent).

## D-12 — Tests

**Aceptada.**

- **Unitarios** (`bun test`): reglas de dominio puras (máquinas de estado, cálculos, validaciones).
- **Integración**: cada comando y consulta contra Postgres real, sin mocks de Prisma. La BD de test es
  el servicio `db-test` de compose (Postgres 16 efímero en tmpfs, puerto 5434, mismos roles, RLS y
  grants que dev) y es **la misma** en local y en CI; los tests cargan `.env.test` (versionado, solo
  valores no secretos) y nunca tocan la BD de desarrollo.
- **Aislamiento**: datos únicos por test (email, UUID, IP) + `cleanup()` al final. **No** hay rollback
  por test (desvío del plan original): los use cases abren sus propias transacciones y envolverlas
  en otra es invasivo y frágil.
- **Matriz de autorización**: tabla rol × recurso × acción × alcance → permitido o denegado, recorrida
  automáticamente contra los endpoints reales. Un test de cobertura exige que **toda ruta registrada**
  tenga al menos una fila que espere 401/403, salvo las de `PUBLIC_ROUTES` (lista explícita y
  comentada). Ruta nueva sin fila → CI rojo.
- **E2E** (Playwright, solo Chromium) en `apps/crm/e2e/`, contra `next build && next start` con la
  BD de test: login, invitación (correo leído de Mailpit), MFA, acceso denegado. El informe de
  asamblea entra cuando exista el módulo.
- **Dónde corre**: el CI (`source-branch`, `quality`, `db`, `test`, `e2e`, `version`) corre **solo en el PR
  `develop → main`** (y `workflow_dispatch`); la primera barrera en cada commit/push son los hooks de
  Husky (Biome + tipos, mensaje de commit, tests + build). `main` tiene protección de rama: PR
  obligatorio con esos cinco checks, sin force-push ni borrado; `develop` sin force-push ni borrado.

## D-13 — Backend con Server Actions (reemplazada)

Acoplaba el frontend a Next: migrar el backend a otro framework obligaba a reescribir toda la capa
de datos del CRM. Ver D-24.

## D-14 — Hosting

**Aceptada.** Web y CRM en Vercel (proyectos separados del mismo monorepo). Pendiente: elegir
Postgres administrado (Neon u otro), revisar que el plan de Vercel cubra el uso de una organización.

## D-15 — Contenido solo en español (reemplazada)

Reemplazada por D-26: todo contenido editable debe poder cargarse traducido.

## D-16 — Sesión por rol

**Aceptada.** Cada rol define si permite sesión persistente y su duración máxima. Si un usuario tiene
varios roles, gana la política más restrictiva. Se valida en servidor en cada request (no solo al
crear la sesión).

*Implementación (0.4):* la duración máxima se verifica en `requireSession` (sesión más vieja que el
mínimo de los roles: se revoca y responde 401); la sesión no persistente la aplica el plugin
`roleSessionPolicy`, que emite la cookie de sesión sin `Max-Age` al iniciar sesión.

## D-17 — Descarga de informes

**Aceptada.** Ningún informe se descarga (PDF, CSV ni otro formato) salvo con autorización
específica (`reports:export`, por formato si hace falta). Cada descarga queda registrada con **qué
información se extrajo**: informe, parámetros (período, filtros, fondos, moneda), formato, cantidad
de filas y hash del archivo generado. Los PDF llevan marca de agua con quién y cuándo. Los
resultados de votaciones nunca se exportan (D-53).

## D-18 — Monedas

**Aceptada**, ampliada por D-51. Cada organización habilita sus monedas (ISO 4217; El Ancla: UYU y
USD). Se registran y se informan siempre por separado; no se guardan tipos de cambio ni se convierte.

## D-19 — Capturas de pantalla

**Aceptada.** Base: marca de agua dinámica, ocultar al perder foco o visibilidad, sin
impresión/selección/descarga y vigencia corta. **A investigar al implementar informes**: detección
custom de intentos de captura (teclas `PrintScreen`, atajos del sistema, pérdida de foco por
herramientas de recorte) que oculte el contenido, y viabilidad de un enfoque tipo DRM. Bloqueo real
solo es posible con app nativa (Android `FLAG_SECURE`).

## D-20 — Ministerio

**Aceptada.** Una sola tabla `Ministry` con dos secciones en el CRM y permisos separados:

- **Contenido** (`ministries.profile`): slug, portada, imágenes, descripción, líderes, horarios,
  visible en web.
- **Tesorería** (`ministries.finance`): presupuestos, solicitudes, historial de movimientos.

Cada sección edita solo sus campos. Un rol de comunicación ve el perfil y no las finanzas; tesorería
ve las finanzas y no edita el perfil.

## D-21 — Base de datos

**Aceptada.** Supabase Postgres con Prisma. Condiciones:

- App en Vercel por el pooler en modo transacción (puerto 6543, `pgbouncer=true`); migraciones por
  conexión directa.
- **Desactivar la Data API (PostgREST)** del proyecto o activar RLS que niegue todo en el schema
  `public`: si no, las tablas quedan expuestas a cualquiera que tenga la clave anónima.
- El plan gratis pausa el proyecto tras 7 días sin actividad y no ofrece backups descargables:
  backup propio diario (`pg_dump` cifrado con `age` a una clave pública, la privada offline con el
  administrador del sistema, a B2 desde un cron de GitHub Actions) con restauración
  probada.
- No se usan Supabase Auth ni Storage (Better Auth y B2 cubren eso).
- RLS activado en todas las tablas (sin políticas = nadie entra por la Data API). Prisma conecta con
  un rol que la saltea.
- El acceso a la consola de Supabase y a los backups es solo del administrador del sistema.

## D-22 — Caché y fluidez

**Aceptada**, con el ajuste de D-24:

- CRM: TanStack Query como capa de datos del cliente sobre el cliente tipado de la API (queries,
  mutaciones con actualización optimista, invalidación por query key). Los Server Components
  precargan e hidratan para que la primera carga no espere al cliente.
- Datos filtrados por permisos nunca van a un caché compartido (ni `"use cache"` ni CDN).
- Web: endpoints públicos de la API con caché de CDN (`s-maxage` + `stale-while-revalidate`) e
  invalidación al publicar desde el CRM.

## D-23 — Comandos/consultas acoplados a Server Actions (descartada)

Poco portable: el contrato entre frontend y backend quedaba implícito en Server Actions.

## D-24 — Backend API-first

**Aceptada.** El backend es una API HTTP con contrato explícito, para que cambiar de framework (o de
lenguaje) no toque los frontends.

- **`apps/api`**: Hono + Better Auth + Prisma. Al principio se monta dentro del CRM
  (`apps/crm/app/api/[[...route]]/route.ts`) y se despliega con él; separarlo en su propio deploy
  (`api.<dominio>`) es cambiar ese archivo.
- **Capas por módulo**: `routes` (HTTP: parseo, status codes) → `service` (casos de uso: permiso,
  transacción, auditoría, reglas) → `data` (Prisma). Es la estructura que comparten NestJS
  (controller/service/module), Express (router/service) y Django (view/service/model).
- **Contrato**: schemas Zod → OpenAPI generado (`@hono/zod-openapi`). Es el artefacto que sobrevive a
  una migración de lenguaje.
- **Seguridad como middleware**: sesión, tenant y `requirePermission('recurso:acción')` por ruta;
  auditoría en el service dentro de la transacción. Equivalen a guards/interceptors en Nest y
  decoradores/middleware en Django.
- **Tests de contrato por HTTP**: la matriz de autorización y los tests de integración golpean la API,
  no funciones internas. Se pueden correr contra cualquier implementación futura.
- **Consumidores**: el CRM usa el cliente tipado (`hc`) + TanStack Query; los Server Components lo
  llaman en proceso, sin salto de red. La web consume los endpoints públicos (deja de importar
  Prisma).
- **Lo que menos se porta**: Better Auth (solo TypeScript) y Prisma. En una migración de lenguaje se
  reemplazan; la BD y los usuarios (login con Google) se conservan.
- **Paquetes**: se elimina `packages/auth` (se muda a la API), se crea `packages/contracts` (Zod
  compartido) y `packages/content` pasa a ser el SDK de la API pública.

Desarrollo: [`architecture/backend.md`](./architecture/backend.md),
[`architecture/api-structure.md`](./architecture/api-structure.md),
[`architecture/security.md`](./architecture/security.md).

## D-25 — Multi-sitio

**Aceptada.** Cada iglesia (tenant, D-02) tiene un sitio propio: relación 1:1, sin tabla `Site`.
`SiteSettings` pasa a ser uno por organización y `SiteApiKey` identifica a la iglesia que consume la
API pública `/public/v1/:churchSlug/...` (versionada con OpenAPI; `packages/content` es su SDK).
Se prepara modelo y contrato; el alta de iglesias y la plantilla web reutilizable van después del
lanzamiento en El Ancla. Desarrollo: [`architecture/multi-site.md`](./architecture/multi-site.md).

## D-26 — Contenido traducible

**Aceptada.** Todo contenido editable desde el CRM admite traducciones. El idioma por defecto de la
organización es obligatorio; los demás son opcionales y, si faltan, se muestra el idioma por defecto.
Los textos de estructura y los narrativos fijos del diseño siguen en i18n (código).

**Modelo propuesto:**

- `Organization.defaultLocale` + `Organization.locales` (idiomas habilitados por iglesia; El Ancla:
  `es`, `en`, `pt`).
- Tabla de traducción por modelo: `XxxTranslation (xxxId, locale, …campos de texto)` con
  `@@unique([xxxId, locale])`. Es el patrón que ya usa `SiteSettingsTranslation`. Los campos no
  textuales (fechas, montos, imágenes, orden) viven en la tabla principal.
- El slug es por traducción (rutas localizadas de la web); si falta, se usa el del idioma por defecto.
- La API pública recibe el idioma (`?locale=`) y resuelve el fallback; la clave de caché del CDN
  incluye el idioma.
- CRM: los formularios muestran pestañas por idioma; el idioma por defecto es obligatorio y se marca
  qué traducciones faltan.
- Tesorería y gobierno **no** se traducen (son datos internos).

## D-27 — Horarios

**Aceptada.** Los horarios son editables y admiten horarios alternativos y especiales. Alimentan
todo lugar donde aparezca un horario: Hero, Sunday, Closing, Visítanos, footer y JSON-LD.

**Modelo:** ver D-31 (los horarios de culto son actividades recurrentes del calendario marcadas
como "horario de culto"). Regla de resolución: excepción de la fecha > conjunto con el switch
manual (`forcedActive`) > conjunto con vigencia que cubre la fecha (el de vigencia más corta si hay
varios) > conjunto predeterminado. Un conjunto sin vigencia solo participa como manual o
predeterminado.

- Los textos fijos que hoy repiten horarios (Closing, Hero) pasan a construirse con estos datos.

*Implementación (1.6a):* `resolveScheduleForDate` y `resolveWeek` (7 días desde hoy local, zona de
`Organization.timezone` vía `Intl`) son funciones puras del módulo `calendar` de la API. Activar
`isDefault` o `forcedActive` en un conjunto se lo quita al que lo tenía (índices únicos parciales como
red de seguridad). Una excepción cuyo reemplazo es un conjunto impide borrarlo (`schedule_set_in_use`).
El switch manual se opera desde el CRM (1.6d, `/calendar/schedule`, "Forzar este horario"); el e2e
comprueba que al activar "Verano" cambian la landing y Visítanos y que al apagarlo vuelve el habitual.

## D-28 — Landing: fijo vs. editable

**Aceptada.** Detalle en [`phases/1-content/1.0-content-map.md`](./phases/1-content/1.0-content-map.md).

- **Fijo** (diseño, i18n en código): todos los textos narrativos, God, Doctrinas, fotos del Hero y de
  Sunday, layout y animaciones.
- **Editable**: horarios (D-27); dirección, email, redes y año de fundación (`SiteSettings`).
- **Derivado de `Ministry`**: el mosaico de Together. Todo el ministerio es editable (nombre
  traducible, slug, enlace externo, mostrar en landing, orden) y cada mosaico elige **foto o color**;
  el color se elige de los tokens que el sistema de diseño de la landing permita, nunca un valor
  libre.
- La foto de Sunday queda fija; si en el futuro se configura, será en una configuración global de
  "Visita" (Sunday + Visítanos).
- *Implementación (1.5):* el mosaico es el índice de ministerios (no hay `/ministerios`) y se
  **calcula**: la API entrega `landing` ordenado (enlaces con `tile` de color o foto) y la web
  reparte esos enlaces y las 3 fotos fijas del diseño en filas (`buildTogetherLayout`); con los 13
  actuales reproduce el layout de hoy. Se guarda directo (`PATCH /content/ministries/landing`), sin
  flujo editorial. Solo entran los ministerios visibles con "mostrar en la landing".
- Lo no mencionado queda fijo.

## D-29 — Ministerio

**Aceptada.** Detalle en [`phases/1-content/1.5-ministries.md`](./phases/1-content/1.5-ministries.md).

- Página de **estructura fija**: "sobre el ministerio" en texto enriquecido + valores opcionales;
  datos prácticos derivados. Sin constructor de bloques.
- Horarios: se cargan como actividades del calendario vinculadas al ministerio, no en el ministerio.
  Hasta la 1.6 el "cuándo" no se muestra en la página.
- Responsables: siempre visibles en el CRM; en la web, opcional por persona (por defecto no). Se
  editan desde el ministerio, no desde Personas.
- **Quién edita qué (ajustada en 1.5):** el **perfil** (texto público) lo edita el líder del
  ministerio (preset `leader`: `ministries.profile:view` + `edit` alcance ministerio, sin `publish`)
  y pasa por el flujo editorial (D-30); publica quien tenga `publish` (p. ej. `content-editor`). La
  **configuración** (categoría, destino, ícono, color, responsables, mosaico, alta) la edita un rol
  con `ministries.profile:edit` (alta: `create`) con alcance `all`; con alcance `ministry` es 403.
  Las finanzas siguen en `ministries.finance` (fase 2).

## D-30 — Flujo editorial

**Aceptada.** Aplica a todo el contenido editable. Quien edita elige publicar directo (si tiene el
permiso `publish`) o enviar a revisión. Además se configuran roles y/o personas con **revisión
obligatoria**: su contenido siempre pasa por aprobación, aunque tengan `publish`. Los revisores (roles y/o personas) se configuran a nivel
sistema. Editar algo publicado no lo cambia en la web hasta aprobar/publicar.

**Modelo propuesto:** estados `DRAFT`, `IN_REVIEW`, `CHANGES_REQUESTED`, `PUBLISHED`, `PAUSED`;
`ContentRevision` con snapshot del borrador; `EditorialSettings` con los revisores. Subfase
[`1.2`](./phases/1-content/1.2-editorial-workflow.md).

**Notas de implementación (1.2):**

- **Las revisiones son el contenido.** El "publicado" de una entidad es su revisión
  `PUBLISHED`/`PAUSED`; hay a lo sumo una revisión de trabajo (`DRAFT`/`IN_REVIEW`/`CHANGES_REQUESTED`)
  y una en vivo por entidad. Lo garantizan **índices únicos parciales** en SQL
  (`content_revisions_one_working`, `content_revisions_one_live`), no el código; una carrera termina
  en 409. Se suma el estado interno `SUPERSEDED` y el historial no se borra (`app_runtime` no tiene
  `DELETE` sobre `content_revisions`).
- **Nadie revisa lo suyo**, tampoco el admin (403 `self_review`): si no, la revisión obligatoria no
  sirve.
- **Publicar directo** exige `publish` y que ni quien publica ni el autor de la revisión estén en
  revisión obligatoria (por persona o por rol). Reanudar algo pausado exige `publish` pero no
  revisión: ya fue aprobado.
- **Los revisores no tienen un permiso propio** (no hay `content:review`): son los de
  `EditorialSettings` por tipo, y el admin. Aun así necesitan `view` del tipo para llegar a las
  rutas de decisión.
- Cada transición y cada cambio de configuración deja su fila de `AuditLog` (`editorial.*`) en la
  misma transacción, sin el snapshot.

**Notas de implementación (1.6b, eventos):** el registro editorial suma un hook opcional `entityVisibleTo(tx, organizationId, entityId, access)` que el motor llama en todas las rutas por entidad (`requireEditorialPermission`, después de `entityExists`): `false` es un 404. Solo lo implementa `event` (un evento interno no existe para quien no esté en su audiencia, ni siquiera para ver su historial); los demás tipos no cambian. `goLiveWorkingRevision` es la primitiva de go-live sin la regla de revisión, para actos que aprueban por sí mismos (publicar un año del calendario).

**Notas de implementación (1.4, blog):** `blog-post` es el primer tipo con esquema real y los tres hooks del registro: `entityExists` (fila `Post` de la organización), `validateSnapshot` (idiomas habilitados) y `beforeGoLive` (409 `slug_taken` y `slug_locked`, 400 `invalid_media|author|category|series`, y fija `Post.firstLiveAt` mientras el artículo nunca fue visible). `crmPath` es `/blog/<id>`, así que la bandeja y los correos de revisión abren el editor. El CRM traduce esos códigos a toasts (`describeEditorialFailure`).

## D-31 — Calendario

**Aceptada.** Detalle en
[`phases/1-content/1.6-calendar.md`](./phases/1-content/1.6-calendar.md).

1. **Actividades recurrentes unificadas.** El culto es una actividad recurrente más, con el switch
   "es horario de culto" (alimenta landing, Visítanos, footer y JSON-LD). Todas las actividades
   cuelgan de un conjunto de horarios (habitual, verano…) y respetan las excepciones por fecha (D-27).
2. **Año con borrador.** El calendario de cada año se arma en borrador y se publica completo; después
   de publicado, los cambios van evento por evento con el flujo editorial (D-30).
3. **Eventos internos.** Cada evento es público o interno; los internos solo se ven en el CRM y se
   define qué roles los ven.
4. **Formatos de impresión** (A4, A3, digital) fijos en el diseño, completados con los datos.
5. **Actividades fijas y por año.** Eventos y actividades varían de un año a otro (fechas, cantidad,
   recurrencia) y pertenecen a un año. Cualquier actividad recurrente puede marcarse **fija**
   (permanente, no depende del año; p. ej. el culto). Cualquier actividad fija puede activar un
   **recordatorio de revisión anual** (¿cambia este año?); es una opción de cada actividad, no algo
   exclusivo del culto.
6. **Cambio de año.** Desde el 1 de enero 00:00 (zona horaria de la iglesia), si el año nuevo no está
   publicado la web muestra solo las actividades fijas públicas. Se calcula en cada request (sin
   tarea programada).
7. **Recordatorios.** Desde el 1 de diciembre, cada 2 días, hasta que el año siguiente esté publicado y
   todas las actividades fijas con revisión anual estén confirmadas para ese año. Se muestran como
   pendientes en el panel del CRM y se envían por email (cron diario de Vercel que respeta la cadencia).
   Destinatarios configurables (roles y/o personas).
8. **Copiar del año anterior** al crear el borrador, con selección detallada de qué copiar: por tipo
   (actividades recurrentes, eventos), por ministerio y por elemento individual. Lo copiado queda marcado
   "a revisar". Las fechas de eventos se trasladan manteniendo el día de la semana (el sábado
   8/5/2027 pasa al sábado más cercano en 2028), con opción de mantener la fecha exacta.

*Notas de implementación (1.6a):* el switch "es horario de culto" es `RecurringActivity.serviceKind`
(`WORSHIP` | `BIBLE_SCHOOL`, nulo = no lo es) para no perder la distinción culto / escuela bíblica que
usan los tokens del sitio. `SiteSettings.serviceTimes` se borró: el DTO público de settings conserva
`serviceTimes` con la misma forma, calculado por la API desde las actividades públicas con
`serviceKind` de la semana en curso (fijas más las del año si está publicado), y suma `timezone`.
Las actividades se editan directo con auditoría (`recurringActivity.*`, `scheduleSet.*`,
`scheduleException.*`, `place.*`), sin flujo editorial. `publicMinistryDto` suma `schedule` (el "cuándo").

*Notas de implementación (1.6b):* el evento es un tipo editorial (`event`) con el snapshot como
fuente; la fila `Event` lleva año, visibilidad y audiencia (configuración directa con auditoría
`event.*`), `sequence` (+1 cada vez que una revisión entra en vivo) y `liveAt`. Publicar el año
(`calendar.year:publish`) es la aprobación: pasa a vivo todas las revisiones de trabajo de sus eventos
en una transacción (`goLiveWorkingRevision`) y, si alguna no puede, no se publica nada. Con el año en
borrador publicar un evento suelto es 409 `year_not_published`. Un evento publicado no se borra
(409 `event_live`), se cancela; uno nunca publicado se borra y su borrador queda `SUPERSEDED`. Un lugar
usado por un evento (en cualquiera de sus revisiones vigentes) tampoco se borra (`place_in_use`).
`shiftDateKeepingWeekday` traslada la fecha al mismo día del mes (29/2 pasa al 28/2) y luego al día de
la semana más cercano (nunca hay empate: una semana tiene 7 días); si ese día cae fuera del año
destino se usa el más cercano dentro de él. La API pública del calendario expone el `uid` del evento
(`<uid>@<host>` en el `.ics`), con `sequence` y `lastModified`: la única excepción a "sin ids
internos", porque el UID de RFC 5545 debe ser estable.

*Notas de implementación (1.6c):* la web lee el calendario de `GET /public/v1/:churchSlug/calendar`
(`getCalendar`); la página usa el año y la zona horaria del DTO ("hoy" = fecha local en `timezone`,
por request). El "próximo" evento es el primero programado que no terminó hoy. Los ministerios del
filtro y sus nombres vienen de la API. Las páginas de impresión siguen en español (decisión de diseño
previa) pero sin años ni fechas fijas. El `.ics` usa `TZID` sin bloque `VTIMEZONE` (se apoya en
`X-WR-TIMEZONE`) y omite `DTEND` cuando el evento no tiene hora de fin.

*Notas de implementación (1.6d):* `shouldRemind(fechaLocal, { targetYearPublished, pendingReviews,
lastSentOn })` es pura y solo dispara en diciembre y enero (año objetivo: el siguiente en diciembre,
el actual en enero), los días con `(días desde el 1/12) % 2 === 0`; el 1/1 es impar, así que enero
sigue el 2, 4, 6... El cron diario (`GET /internal/calendar/reminders`; `?now=` solo fuera de
producción, para probar la cadencia a mano) recorre las organizaciones, avisa a los destinatarios
configurados (roles y personas) o, si no hay ninguno, a los administradores, y guarda `lastSentOn` solo
si al menos un email salió. Audita `calendarReminder.sent` (actor `cron`) y `calendarReminder.settingsUpdated`.
`GET /content/calendar/pending` habla del año por empezar (el siguiente en diciembre, el actual el resto
del año): su estado (falta crearlo, borrador o publicado) y las actividades fijas con revisión anual
sin confirmar; alimenta las cards de `/calendar` y del `/dashboard`. Guardar una actividad desde el CRM
limpia `needsReview` (la confirmación de lo copiado del año anterior). El CRM no tiene i18n: sus textos
son en español; los colores de ministerio se resuelven a hex en el CRM (`ministryColorValue`, espejo de
los tokens de `apps/web/src/styles/global.css`), porque el CRM no carga el `@theme` de la web.

## D-32 — Blog

**Aceptada.** Detalle en [`phases/1-content/1.4-blog.md`](./phases/1-content/1.4-blog.md).

- Cuerpo en Tiptap con un nodo propio por bloque del diseño; JSON por idioma; render sanitizado.
- Una categoría + tags. Portada foto o de diseño.
- Autor: información libre editable; métricas del sistema calculadas.
- **Sin comentarios ni reacciones.** Sí conteo anónimo de visitas (agregado por día, sin datos
  personales) para "más leídos" y métricas internas. El posicionamiento en buscadores no depende de
  este conteo: para eso está Search Console.
- Revisión obligatoria configurable por autor/rol (D-30).

**Notas de implementación (1.4a):** el snapshot es la fuente de verdad (sin tablas de traducción del artículo). Hooks de `blog-post`: `entityExists`, `validateSnapshot`, `beforeGoLive` (409 `slug_taken`, 409 `slug_locked`, 400 `invalid_media`/`invalid_author`/`invalid_category`/`invalid_series`, y fija `Post.firstLiveAt`). Visitas: la web reenvía `{ ip, userAgent }`; la API descarta bots, guarda solo `HMAC-SHA256(VIEW_HASH_SECRET, día + ip + ua)` en `PostViewVisitor` y cuenta en `PostViewDaily`; el purge borra los hashes de días anteriores. Programación: filtro en lectura, sin job (la caché puede retrasar la visibilidad hasta su TTL).

**Notas de implementación (1.5c):** el CRM monta `EditorialStatusBar` con `contentType="ministry"`; el líder solo ve el perfil y envía a revisión, y las cards de configuración, el mosaico y las categorías se ocultan sin alcance `all` (`canWithAllScope`).

**Notas de implementación (1.5a):** ministerios adopta el flujo con el snapshot como fuente (`ministrySnapshot`, sin tablas de traducción): hooks `entityExists`, `validateSnapshot` y `beforeGoLive` (409 `slug_taken`/`slug_locked`, 400 `invalid_media`). Los chequeos de slugs y medios son genéricos (`registry/slugs/`, `registry/media/`) y los comparten blog y ministerios. Visible en la web = revisión `PUBLISHED`; pausar oculta.

**Notas de implementación (1.4c):** el CRM edita el snapshot con el esquema real (`blogPostSnapshot`) y un editor Tiptap con un nodo por bloque del diseño (`blogRichTextDocSchema`); el slug de un idioma ya publicado se deshabilita en el formulario (la API lo exige igual con `slug_locked`). Los autores son `PersonProfile` con el rol `BLOG_AUTHOR`, que se edita en Sitio web → Personas junto con sus estadísticas libres. Categorías y series se administran en `/blog/taxonomy` con el permiso `blogPosts`.

## D-33 — Estado por sección

**Aceptada.** Cada sección del sitio (blog, calendario, sermones, ministerios, galería…) tiene estado
propio: **activa**, **mantenimiento** (muestra la pantalla de mantenimiento de esa sección) o **fuera
de servicio** (no se enruta y sale de la navegación). Convive con el estado general del sitio.

*Implementación (1.3a):* el estado vive en la columna JSON `SiteSettings.sectionStatuses` (no hay tabla `SiteSection`; una clave ausente es `activa`), con claves `blog`, `calendar`, `sermons`, `ministries`, `visit` (`SITE_SECTION_KEYS`). La web responde 503 con la pantalla de mantenimiento de sección o reescribe a 404 y oculta la sección de Nav, Footer, sitemap y `llms.txt`.

## D-34 — Newsletter

**Aceptada.** Suscripción desde la web con doble opt-in, baja con un clic, registro de
consentimiento (Ley 18.331). Envío **manual** desde el CRM (se arma eligiendo artículos); no hay envío automático al publicar. Detalle en
[`phases/1-content/1.9-newsletter.md`](./phases/1-content/1.9-newsletter.md).

## D-35 — Sermones

**Aceptada.** Detalle en [`phases/1-content/1.7-sermons-podcasts.md`](./phases/1-content/1.7-sermons-podcasts.md).

- **No se publican solos.** Se cargan a mano pegando el identificador de YouTube; el CRM precarga
  título, portada, duración y fecha, y se completan predicador, pasajes, comentarios, bosquejo,
  etc. Pasan por el flujo editorial (D-30).
- **Series**: modelo propio, manual o importada de una lista de YouTube, con presentación local
  (descripción, portada, tags). Si no existe al cargar un sermón, se crea en el momento y se edita
  después. Cantidad y fechas, calculadas.

*Implementación (1.7a):* el sermón es un tipo editorial (`sermon`) con el snapshot como fuente: sin
`SermonTranslation` ni `SermonPassage`; la fila `Sermon` es `{ id, organizationId, firstLiveAt? }` y los
pasajes (≤6) y adjuntos PDF (≤3) viven en el snapshot. Lo que viene de YouTube (portada, duración, vistas,
fecha original) vive en `PlatformLink`, así refrescarlo nunca pisa lo editado; el video es la identidad del
sermón (`video_already_linked` si ya está cargado). `SermonSeries` se guarda directo con auditoría
(`sermonSeries.*`, `sermon.*`), sin flujo editorial; `youtubePlaylistId` es único por organización solo
entre series vivas (índice único parcial) y la importación responde 422 `invalid_playlist_id`, 404
`playlist_not_found` y 409 `playlist_already_imported`. Borrar una serie con sermones es 409 `series_in_use`;
borrar un sermón con revisión viva, 409 `sermon_live`. Sin `YOUTUBE_API_KEY` la precarga es 503
`platform_unavailable`; un fallo de transporte del adaptador (`PlatformRequestError`: red, cuota, clave
rechazada) también se traduce a 503 y nunca se cachea como "no en vivo". Con una API key YouTube omite los
videos privados, así que `video_private` casi no se detecta: lo normal es `video_not_found`. Los PDFs usan el
propósito de media `contentDocument` (público, 20 MB, `content.sermons:edit`). Las rutas de sermones tienen su
propio tipo de app (`SermonsAppType`) para no pasar el límite de instanciación de `hc<AppType>`. Un cron diario
(`GET /internal/platforms/refresh`, 05:00, `requireCronSecret`) refresca las métricas. El script de importación
inicial (`importYoutubeSermons`) queda pendiente de decisión: el puerto del plan no puede listar los videos de
una playlist ni las playlists del canal.

## D-36 — Podcasts

**Aceptada.** Uno o varios programas (hoy hay uno, aparte de las prédicas). Los episodios viven en
plataformas externas (hoy YouTube; preparado para Spotify for Creators y otras) y se cargan igual que
los sermones: por identificador, con precarga. Nunca se aloja audio propio.

*Implementación (1.7a, solo lo que ya queda fijado):* el puerto `VideoPlatform` (`core/platforms`) tiene el
adaptador de YouTube y se reusa para los episodios; no habrá `PodcastPlatform` hasta que exista el adaptador de
Spotify for Creators. Los enlaces por plataforma se guardan en `PlatformLink` (`entityType` `PODCAST_EPISODE`,
`platform` `YOUTUBE | SPOTIFY | APPLE_PODCASTS`); los modelos de podcast llegan en 1.7d.

## D-37 — Galería diferida

**Aceptada.** La galería no entra en la primera versión. La subfase
[`1.8`](./phases/1-content/1.8-gallery.md) queda como base para retomarla.

## D-38 — Visítanos

**Aceptada.** Hero y "Qué esperar" fijos. Horarios (actividades "horario de culto"), dirección y
JSON-LD derivados de los datos. Editables y traducibles: indicaciones (estacionamiento, transporte,
accesibilidad) y preguntas frecuentes; las preguntas de horario y dirección se generan solas para no
quedar desactualizadas. Confesión de fe, nav y footer: fijos.

*Implementación (1.3a):* horarios, dirección y JSON-LD ya salen de `SiteSettings` (puente `serviceTimes` hasta la 1.6); las indicaciones y las FAQ editables llegan en 1.3c.

*Implementación (1.3c):* las indicaciones viven en `SiteSettingsTranslation.directions*` y las FAQ en `VisitFaq` (+ traducción), con RLS y permiso `content.visit`; se guardan directo (`PUT /site/visit`, lista completa, un audit `visit.updated`), sin flujo editorial. La web arma las dos preguntas generadas (horario y dirección) con `buildGeneratedFaqs` a partir de `serviceTimes` y la dirección, y las muestra antes de las editables; el JSON-LD `FAQPage` las incluye todas. Las respuestas editables aceptan `{worshipEnd}` y `{email}`, que la web completa con los datos del sitio. Las indicaciones vacías no se muestran.

## D-39 — Nosotros

**Aceptada.** Todo fijo (identidad, valores, historia con su línea de tiempo, enlaces) salvo el
**equipo**, que es editable porque cambia con las rotaciones.

*Implementación (1.3a):* se borra `aboutRichText` (la web nunca lo mostró); el equipo editable llega en 1.3b.

## D-40 — Perfil público de persona

**Aceptada.** Un único `PersonProfile` (nombre, foto o iniciales, bio, vínculo opcional a usuario)
usado en varios contextos: autor del blog, predicador, responsable de ministerio, equipo. En cada
contexto se define rol, orden y si se muestra en la web.

*Implementación (1.3b):* `PersonProfile` (+ traducción de la bio) y `PersonRole` (+ traducción del título) con `@@unique([personProfileId, contexto])`; el enum `PersonContext` ya trae los cuatro contextos para que 1.4, 1.5 y 1.7 solo sumen su pantalla en el CRM. Se guardan directo (permiso `content.people`, auditoría `personProfile.*`), sin flujo editorial. La API pública (`people?context=`) devuelve solo los roles visibles del contexto, sin ids, con la foto como lista de variantes `webp`. Las iniciales se calculan en la API. El CRM de 1.3b muestra solo el contexto Equipo y conserva los roles de otros contextos al guardar. Borrar una persona borra sus roles en cascada.

## D-41 — Páginas simples

**Aceptada.** Tipo de página editable con título, slug, cuerpo en texto enriquecido y SEO, todo
traducible, con flujo editorial. Sin constructor de bloques. La primera es la política de privacidad,
obligatoria antes de habilitar el newsletter.

*Implementación (1.3d):* `SimplePage` guarda solo la identidad; el contenido por idioma (`title`, `slug`, `body`, `seoTitle`, `seoDescription`) es el snapshot de la revisión editorial, validado por `simplePageSnapshot`. El cuerpo es Tiptap **JSON** con lista blanca de nodos y marcas (`richTextDocSchema`, `href` solo `http(s):`/`mailto:`, profundidad y tamaño acotados) y la web lo renderiza con un renderer propio que escapa todo, sin dependencia de sanitizado. Los slugs viven en la raíz (`/privacidad`) y no pueden usar `RESERVED_ROOT_SLUGS`; la unicidad entre páginas en vivo la valida el hook `beforeGoLive` del registro editorial (409 `slug_taken`). Las páginas se pausan, no se borran. El seed de desarrollo crea la política de privacidad como borrador con texto de ejemplo (solo si ya existe un usuario que la firme como autor); el texto legal real lo carga la iglesia y su publicación previa al newsletter la exige la 1.9.

## D-42 — Circuito de egresos

**Aceptada.** Ministerio o miembro solicita → aprobación → **orden de compra** → movimiento de
egreso → **rendición** → devolución del sobrante → cerrada.

Glosario (vale para código, UI y documentación):

- **Orden de compra**: la justificación/autorización para comprar algo.
- **Factura**: el comprobante formal que entrega el comercio al comprar (impreso o electrónico).
- **Comprobante de caja**: recibo interno que se genera cuando no entregan factura o la factura es
  irregular (p. ej. una hoja a mano sin datos); se adjunta la imagen del papel si existe.

El término "boleta" no se usa en el sistema. Equivalencia con el ESRE: la "boleta" del ESRE
(RF-14..16) es la **orden de compra**; el "comprobante de caja" del ESRE (RF-17..19) se mantiene.
Sus reglas de bloqueo se aplican a los equivalentes.

## D-43 — Cuentas y transferencias

**Aceptada.** Cuentas por moneda (efectivo, caja fuerte, BROU, Santander…). Movimiento de tipo
**transferencia** entre cuentas, que no cuenta como ingreso ni egreso.

## D-44 — Rubros y ofrendas designadas

**Aceptada.** Lista editable de rubros de ingreso y egreso; cada movimiento lleva rubro. **No se
registra quién diezma u ofrenda.** Una ofrenda anónima puede estar **designada** a un ministerio,
actividad o situación, con un comentario; el comentario se marca confidencial o no, y los
confidenciales solo los ve quien tenga el permiso correspondiente (cada lectura auditada).

## D-45 — Solicitudes: anticipación y topes

**Aceptada.**

- Solicitudes por encima de un monto (hoy 3.000 UYU; lo fija la directiva, configurable por moneda)
  deben hacerse con **15 días** de anticipación (configurable), aunque estén dentro del presupuesto.
  Si no se cumple, la solicitud se acepta marcada **fuera de plazo** y requiere aprobación de
  directiva.
- Solicitudes **fuera de presupuesto**: topes de aprobación configurables por moneda; por encima del
  tope, aprueba directiva.

## D-46 — Cierre mensual

**Aceptada.** Los movimientos de un mes cerrado no se editan. Reabrir exige un permiso específico,
motivo, y queda auditado.

## D-47 — Conciliación bancaria

**Aceptada.** Importación de extractos (CSV/Excel) con sugerencia de coincidencias y marca de
conciliado / pendiente / observado. Los formatos no se atan a bancos fijos (D-51): plantillas por
banco sugeridas y un importador genérico con mapeo de columnas configurable. Requiere extractos de
ejemplo.

## D-48 — Presupuestos

**Aceptada.** Presupuestos **anuales** por **ministerio** y por **proyecto**, por moneda, con plan
mensual opcional. Cada mes se define **a mano** la asignación, en base a los pedidos y montos
solicitados; el sistema muestra el **estimativo mensual** (plan + solicitudes) pero nunca asigna
solo. La asignación puede ser menor a lo planificado y lleva motivo. Las órdenes de compra se pagan
contra lo asignado. Lo sobrante se devuelve a la iglesia (transferencia de fondo, D-49) y queda
asentado.

## D-49 — Fondos

**Aceptada.** Cada movimiento tiene **cuenta** (dónde está el dinero) y **fondo** (a quién
pertenece: general, ministerio o proyecto). Ofrendas designadas y especiales ingresan al fondo
correspondiente; devolver sobrantes es transferencia de fondo; depositar efectivo en el banco es
transferencia de cuenta; el saldo del fondo es "el dinero que el ministerio tiene para su actividad"
(RF-02); los informes por ministerio y proyecto salen del fondo.

## D-50 — Aportantes en ofrendas especiales

**Aceptada.** Las ofrendas especiales para proyectos se identifican con el proyecto. Al crear el
proyecto se decide si se **identifica a los aportantes** (familia o persona) para seguimiento. La
identidad es confidencial: solo la ve un rol con ese permiso, cada lectura queda auditada y los datos
de aportantes se guardan cifrados a nivel de aplicación. Los aportantes no son perfiles públicos
(D-40) ni usuarios.

## D-51 — Preparado para varios países

**Aceptada.** Nada contable queda atado a Uruguay:

- `Organization` con país, monedas habilitadas, zona horaria e idiomas.
- **Bancos**: catálogo de bancos sugeridos por país + bancos personalizados por organización.
- **Extractos**: plantillas de importación por banco + importador genérico con mapeo de columnas.
- Montos, umbrales y topes siempre por moneda; formatos de fecha y número según el idioma.

## D-52 — Sin informes por email

**Aceptada.** Los informes **nunca** se envían por email (ni adjuntos ni en el cuerpo). Se depreca
esa parte del ESRE 2.1.4. Los informes solo se ven en el CRM con permisos y auditoría, y se exportan
según D-17. Al implementar, se elimina la plantilla `apps/crm/emails/templates/report-email.tsx`.

## D-53 — Gobierno: padrón, acreditación y votaciones

**Aceptada como base.** Puede no implementarse en la primera versión. Detalle en
[`phases/3-governance/3.2-voting.md`](./phases/3-governance/3.2-voting.md).

- Se votan **mociones**, solo en **asambleas**.
- **Elección de directiva: voto secreto.** Cualquier otra moción: **voto abierto** (equivale a mano
  alzada).
- **Padrón**: registro de miembros de la iglesia con derecho a voto. Son datos personales; los miembros
  no son usuarios (pueden vincularse a uno).
- Solo votan los **presentes** acreditados en la asamblea, presencial o virtual.
- Tres vías de voto que terminan en **un solo voto por miembro y por moción**:
  1. Miembro que es usuario: vota logueado.
  2. Miembro sin usuario: código de un solo uso entregado al acreditarse.
  3. Miembro sin celular: el moderador registra su voto (auditado).
- En voto secreto el sistema registra que el miembro votó, pero **nunca** a qué opción.
- **Los resultados no se exportan fuera del sistema.**

## D-54 — Acta de asamblea

**Aceptada.** El acta se escribe **en vivo** en el sistema durante la asamblea, o se **carga** desde
un Word o texto para asentarla.

- Guardado automático continuo y **modo offline**: el borrador se guarda en el dispositivo y se
  sincroniza al recuperar conexión, para no perder nada.
- Un solo redactor a la vez (bloqueo de edición) para evitar conflictos al sincronizar.
- El borrador local se borra del dispositivo al sincronizar y cerrar.
- Word subido: se guarda como archivo privado y se extrae su texto.
- Impresión o descarga (p. ej. para el libro de actas) solo con autorización, con marca de agua y
  registro según D-17.

## D-55 — Versionado

**Aceptada.** Un **único SemVer para todo el monorepo**, en el `version` del `package.json` raíz
(las apps y paquetes son privados y no se versionan por separado). Tags `vX.Y.Z` y `CHANGELOG.md`
generados de los Conventional Commits con `commit-and-tag-version`.

- Mientras sea `0.x`: `feat` → minor, `fix` y demás → patch, breaking → minor (`preMajor`).
- **`v0.1.0` = base técnica** (cierre de la fase 0.7).
- Cada `develop → main` con features sube el minor (0.2.0…), con solo fixes sube el patch (0.2.1).
- **`1.0.0`** recién con producción (1.10) y tesorería (fase 2) en uso real.
- Flujo: en `develop`, con todo mergeado, `bun run release` (bump + changelog + commit + tag) →
  `git push --follow-tags` → PR `develop → main`. El job `version` del CI falla si el `package.json`
  del PR no supera el último tag de `main`.
