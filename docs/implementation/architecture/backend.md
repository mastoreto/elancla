# Arquitectura de backend

Decisión de origen: D-24. Estructura de carpetas: [`api-structure.md`](./api-structure.md).
Seguridad de comunicaciones: [`security.md`](./security.md).

## Estilo

**Monolito modular en capas, API-first.** Un solo deploy, módulos con fronteras claras, contrato HTTP
explícito. Se elige porque es el estilo que comparten Hono, NestJS, Express y Django: migrar es
traducir, no rediseñar.

```
HTTP ──► middlewares (core) ──► routes ──► useCase ──► data ──► Postgres
          seguridad, ctx       controller   service     repository
                                   │           │
                                   │           ├──► domain (reglas puras)
                                   │           └──► puertos (storage, mail)
                                   └──► mappers ──► DTO (contracts) ──► respuesta
```

### Responsabilidad de cada capa

| Capa | Hace | No hace nunca |
|---|---|---|
| `core/http` middlewares | Cabeceras, CSRF, rate limit, request id, sesión → `ctx`, tenant | Lógica de negocio |
| `*.routes.ts` | Declara ruta + permiso + schemas; llama al use case; elige status code | Tocar Prisma, decidir reglas |
| `useCases/` | Orquesta: autoriza recurso, abre transacción, aplica reglas, persiste, audita | Conocer HTTP (`Context`, headers, status) |
| `domain/` | Reglas puras: transiciones de estado, invariantes, cálculos | I/O de cualquier tipo |
| `data/` | Consultas Prisma con `select` explícito, siempre filtradas por tenant | Reglas de negocio, autorización |
| `mappers/` | Entidad → DTO | Exponer campos no declarados en el contrato |

Dependencias permitidas: `routes → useCases → (domain, data, puertos)`. Nunca al revés, nunca entre
`data/` de módulos distintos. Un módulo consume a otro **solo** por su barrel (`index.ts`), que expone
use cases, no repositorios. Se verifica con una regla de lint de imports.

## Contrato

- Schemas Zod en `packages/contracts`, por módulo: `xxxInput`, `xxxDto`, `xxxListQuery`.
- Todo schema de entrada es `.strict()`: campos desconocidos → 400.
- Toda respuesta se serializa **a través** del DTO. Nunca se devuelve un objeto de Prisma.
- `@hono/zod-openapi` genera el OpenAPI de la API privada y de la pública (`/public/v1`). El OpenAPI
  público se versiona y es lo que cualquier sitio futuro consume.
- Errores en formato Problem Details (RFC 9457): `type`, `title`, `status`, `code`, `requestId`.
  Sin stack ni mensajes internos.

## Patrones: cuándo sí y cuándo no

| Patrón | Dónde se usa | Por qué |
|---|---|---|
| **Middleware chain** (cadena de responsabilidad) | Seguridad transversal en `core/http` | Cada control es una pieza aislada, ordenada y testeable |
| **Policy** | `*.policy.ts` + `core/authz` | Separa "quién puede" del caso de uso; cubre propiedad (el creador edita su proyecto) y alcance |
| **Unit of Work** | Transacción interactiva de Prisma en todo use case que escribe | Mutación + auditoría + correlativo son atómicos |
| **Repository** (funciones, sin interfaz) | `data/` | Concentra consultas; sin interfaz porque hay una sola implementación y se testea contra BD real |
| **DTO + Mapper** | Toda respuesta | El contrato no depende del schema de BD; evita filtrar campos |
| **State machine** (tabla de transiciones) | Solicitudes, órdenes de compra, proyectos, votaciones, publicaciones | Las reglas de estado del ESRE quedan en un solo lugar, puras y testeables |
| **Strategy** | Tipos de informe (anual, ministerial, por proyecto…), canales de notificación | Agregar un tipo es registrar una estrategia, no editar un `switch` (OCP) |
| **Adapter + Port** (con interfaz) | `FileStorage` (un adaptador S3-compatible sobre `aws4fetch`: B2 en producción, un servidor S3 en `docker-compose` y tests), `Mailer` (proveedor / consola) | `FileStorage` tiene un solo adaptador porque B2 y el S3 local hablan el mismo protocolo; el puerto queda para que cualquier otro adaptador pase la misma suite de contrato. `Mailer` sí tiene 2 implementaciones reales |
| **Optimistic locking** | Entidades editables de tesorería y contenido (`version`) | Dos tesoreros editando lo mismo → 409, no se pisa |
| **Idempotency key** | Altas contables (`Idempotency-Key`) | Un doble click o reintento no crea dos movimientos |
| **Query object** | Filtros de listados | Campos y orden filtrables en lista blanca; nada de `where` armado desde el cliente |
| **Outbox** | *Todavía no.* Mails y webhooks salen con `waitUntil` tras el commit y quedan registrados | Se adopta si se pierden envíos o aparecen webhooks a sitios externos |

**Prohibidos** (complejidad sin retorno): repositorio genérico base, herencia entre services,
service locator, bus de eventos de dominio, decoradores mágicos, interfaces con una sola
implementación.

## SOLID aplicado

- **S**: un use case por archivo; `routes` solo traduce HTTP; `data` solo persiste.
- **O**: módulos nuevos se registran en `app.ts`; informes y canales nuevos, como estrategias.
- **L**: los adaptadores de un puerto pasan la **misma** suite de tests de contrato (hoy el adaptador S3 contra el S3 local; un adaptador nuevo corre `runFileStorageContract`).
- **I**: puertos chicos (`FileStorage`, **uno por bucket**, sin parámetro de bucket: `presignUpload`, `presignDownload`, `head`, `get`, `put`, `delete`); DTOs
  por caso de uso, no una entidad gigante.
- **D**: el use case recibe sus dependencias por parámetro (`ctx`, `tx`, puertos); se componen en
  `app.ts`. Nada se importa "por la espalda" dentro de la lógica.

## Forma de un use case

```ts
export async function voidMovement(deps: VoidMovementDeps, input: VoidMovementInput): Promise<MovementDto> {
  const { ctx, db } = deps;
  return db.transaction(async (tx) => {
    const original = await movementsRepository.findForUpdate(tx, ctx, input.id);
    authorizeMovement(ctx, "void", original);           // policy
    assertCanVoid(original);                            // domain
    const reversal = await createReversal(tx, ctx, original, input.reason);
    await writeAudit(tx, ctx, { action: "movement.voided", entity: original, reason: input.reason });
    return toMovementDto(reversal);
  });
}
```

## Autorización (`core/authz`)

Cada ruta declara quién puede llamarla con **uno** de estos middlewares (sin declaración el test de
introspección del router en `app.test.ts` falla):

- `requirePermission("recurso:acción")`: va después de `requireSession`; 403 si ningún rol del
  usuario lo concede. El rol `admin` tiene todos los permisos de forma implícita (sin filas en
  `RolePermission`), incluidos los recursos futuros.
- `allowAnySession` (= `requireSession`): cualquier usuario con sesión (p. ej. `GET /me/permissions`).
- `allowPublic`: ruta pública a propósito (health, enlaces de invitación, Better Auth).

`requireSession` carga el acceso del usuario con `loadAccess` (una consulta: roles, grilla, ministerios)
y lo deja en `ctx.access`. Con varios roles los permisos son la unión y, para un mismo
`recurso:acción`, gana el alcance más amplio (`all > ministry > own`). El catálogo de recursos,
acciones y alcances vive en `packages/contracts/src/authz` y lo comparten API y CRM.

**Los permisos se referencian solo mediante `PERMISSIONS`** (`PERMISSIONS.movements.view`,
`PERMISSIONS.ministryProfile.edit`), nunca escribiendo el string a mano. Se derivan del catálogo
(`PERMISSION_CATALOG`, cuyas claves son identificadores de código y cuyo `resource` es el valor que se
guarda y viaja en los DTOs, sin cambios), con tipos: solo existen las acciones que el catálogo permite
(`PERMISSIONS.settings.create` no compila) y `Permission` es la unión de esos pares. Las grillas se
arman con `grant(PERMISSIONS.requests.view, "ministry")`. Un test en `packages/contracts`
(`noHandWrittenPermissions`) recorre `apps/api`, `apps/crm` y `packages` y falla con `archivo:línea`
ante cualquier `"recurso:acción"` escrito a mano fuera del catálogo.

Las policies de recurso (`roles/policies`, `users/policies`) aplican las protecciones: el rol `admin`
no se edita ni se borra, los sembrados no se borran, nadie cambia sus propios roles o ministerios,
nadie edita un rol que tiene asignado, solo un admin concede o quita el rol `admin` y nunca se quita
al último. Las mutaciones corren en `withTransaction` y llaman a `writeAudit` dentro de la misma
transacción.

Matriz de pruebas: `test/support/authzMatrix.ts` genera un caso por fila `{ grilla del rol, método,
ruta, status esperado }`; cada módulo agrega sus filas.

## Consultas: estándar obligatorio

1. **Tenant siempre.** El cliente Prisma por request está extendido para inyectar
   `organizationId` en los modelos de dominio. Además, cada repositorio lo pasa explícito. Un test
   recorre los modelos y falla si alguno escapa al filtro.
2. **Alcance siempre.** `scopeWhere(ctx, permission, { ownerField?, ministryField? })`
   (`core/authz`) devuelve el filtro del alcance que el usuario tiene sobre ese permiso: `all` →
   `{}`, `ministry` → `{ [ministryField]: { in: ctx.access.ministryIds } }`, `own` →
   `{ [ownerField]: ctx.user.id }`. Falla cerrado: sin permiso, o si el recurso no tiene la columna
   que pide el alcance, el filtro no coincide con ninguna fila.
3. **`select` explícito.** Prohibido devolver la fila entera o `include` sin `select`.
4. **Paginación por cursor** (UUIDv7 ordenable), `limit` máximo 100, por defecto 25.
5. **Filtros y orden en lista blanca** (query object); nada del cliente llega crudo al `where`.
6. **SQL crudo** solo con `$queryRaw` (template parametrizado). `$queryRawUnsafe` y
   `$executeRawUnsafe` prohibidos por regla de lint.
7. **Índices** compuestos que empiezan por `organizationId` en toda tabla filtrable.
8. **Sin N+1**: relaciones en el mismo `select`; listados medidos en tests de integración con
   conteo de queries en los endpoints críticos.
9. **Escrituras**: dentro de transacción; `version` para concurrencia; borrado lógico (`deletedAt`)
   en contenido; en tesorería no hay borrado, hay anulación.
10. **Montos**: `Decimal` en BD, string decimal en el contrato. Nunca `number` para dinero.

## Consumo desde el CRM

- `lib/api`: cliente tipado de Hono (`hc<AppType>`). En el navegador va por HTTP con cookies; en
  Server Components se llama **en proceso** (`app.request`) reenviando las cookies del request.
- `lib/query`: `queryKeys` por módulo (`movementsKeys.list(filters)`), `staleTime` por defecto
  30 s, mutaciones con actualización optimista e invalidación por clave.
- Las páginas RSC precargan (`prefetchQuery`) y entregan el estado hidratado.
- Al cerrar sesión: `queryClient.clear()`. Nunca se persiste el caché de queries en el navegador.

## Errores de dominio → HTTP

| Error | Status |
|---|---|
| `ValidationError` | 400 |
| `Unauthenticated` | 401 |
| `Forbidden` | 403 (o 404 si revelar la existencia ya es una filtración) |
| `NotFound` | 404 |
| `Conflict` / versión vieja / estado inválido | 409 |
| `RateLimited` | 429 |
| cualquier otro | 500 con `requestId`, detalle solo en logs |

## Auditoría (`core/audit`)

`writeAudit(client, source, event)` agrega una fila a `audit_logs` (D-10). Reglas:

- **Mutación ⇒ estricta y en su transacción.** Se le pasa el `tx` del use case: si la mutación hace
  rollback no queda registro, y si la auditoría falla, falla toda la mutación. Los repositorios que
  participan reciben `tx`; el `before` se lee **dentro** de la transacción (y con `lockRole` cuando
  corresponde) y el `after` también, para que refleje lo escrito.
- **Eventos sin mutación ⇒ best-effort.** Denegaciones (se registran en `errorHandler` para todo
  `ForbiddenError`, tras el rollback) y eventos de Better Auth (`auditHooks`, `onPasswordReset`,
  `sendResetPassword`) usan `writeAuditBestEffort`: un log caído no convierte un 403 en 500 ni rompe
  un login ya hecho; se reporta con `console.error` y `requestId`.
- **`AuditSource`** dice quién y desde dónde: `auditSourceFrom(ctx, organizationId)` en rutas y use
  cases; `auditSourceFromHeaders(headers, …)` en hooks de Better Auth (sin `RequestContext`; por eso
  `authRouter` y `acceptInvitation` reenvían el `X-Request-Id` generado con `withRequestId`);
  `auditSourceForCli` para scripts (`invite` ⇒ actor `cli`).
- **`before`/`after` son DTOs** (`toRoleDto`, `toInvitationDto`…, sin `tokenHash`); `redact()` es
  defensa en profundidad con una lista exacta de claves secretas.
- Las acciones se nombran solo con `AUDIT_ACTIONS` (`packages/contracts/src/audit`).
- **Lecturas sensibles** (documentos privados, informes, exportaciones): el mecanismo ya sirve
  (`*.read`, `*.exported`); cada módulo las cablea cuando exista. Leer `GET /audit` no se audita.
- El correo de una invitación sale **después** del commit.
- Eventos de auth sin clasificar (anotados con `ponytail:` en `classifyAuthEvent`): el callback social
  y el actor de un segundo paso fallido.

## Tests

La BD de test es efímera (`db-test` de compose, tmpfs, puerto 5434) y las variables salen de
`.env.test` (versionado, sin secretos); los tests nunca usan la BD de desarrollo.

```bash
bun run test:infra   # db-test + mailpit + s3 (+ buckets)
bun run test:db      # migrate deploy + seed sobre db-test
bun run test         # unitarios + integración (api, db, contracts, crm) y scripts/ (hooks, release)
# E2E (Playwright, apps/crm/e2e): build contra la BD de test y luego correr
bun --env-file=.env.test run --filter crm build && bun run test:e2e
```

- Aislamiento: cada test usa datos únicos (`fixtures.uniqueEmail()`, `uniqueIp()`, UUID) y limpia al
  final con `fixtures.cleanup()`; no hay rollback por test (D-12).
- **Matriz de autorización** (`core/authz/authzMatrix/authzMatrix.test.ts`): al agregar un endpoint,
  agregá filas `MatrixRow` (quién llama, método, ruta, estado esperado). Hace falta al menos una fila
  que espere **401/403** para esa ruta; si no, el último test (`findUnguardedRoutes`) falla nombrando
  `METHOD /api/ruta`.
- **`PUBLIC_ROUTES`**: solo para rutas que cualquiera puede llamar a propósito (Better Auth, health,
  el token de invitación, el documento OpenAPI) y que tienen su propio test. Una ruta con permiso,
  sesión o bearer **no** va ahí: lleva filas en la matriz.
- `bun run --filter @ancla/db db:drift` falla si cambiaste `schema.prisma` sin crear la migración.
