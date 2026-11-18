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
| **Adapter + Port** (con interfaz) | `FileStorage` (B2 / local), `Mailer` (proveedor / consola) | Acá sí hay 2+ implementaciones reales: producción y desarrollo/test |
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
- **L**: los adaptadores de un puerto pasan la **misma** suite de tests de contrato (B2 y local).
- **I**: puertos chicos (`FileStorage`: `presignUpload`, `presignDownload`, `head`, `delete`); DTOs
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

## Consultas: estándar obligatorio

1. **Tenant siempre.** El cliente Prisma por request está extendido para inyectar
   `organizationId` en los modelos de dominio. Además, cada repositorio lo pasa explícito. Un test
   recorre los modelos y falla si alguno escapa al filtro.
2. **Alcance siempre.** `scopeWhere(ctx, resource)` agrega el filtro de `own | ministry | all`.
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
