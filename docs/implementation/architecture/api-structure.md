# Estructura de la API (`apps/api`)

**Aceptada** (D-24). Toda implementación del backend sigue esta estructura. Capas, patrones y estándar
de consultas: [`backend.md`](./backend.md). Seguridad: [`security.md`](./security.md).

Nombres de código (carpetas, archivos, funciones, variables, tipos) **siempre en inglés**. Los
comentarios de este documento están en español solo como explicación.

## Hoy: dónde está el "backend"

No existe como tal; está repartido:

```
apps/api/src/core/auth/                      Better Auth (Google + email/contraseña, 2FA, rate limit)
apps/api/src/scripts/invite/                 alta del primer admin (crea su invitación)
packages/db/prisma/schema.prisma             schema (sin migraciones)
packages/db/src/index.ts                     cliente Prisma
apps/crm/app/api/[[...route]]/route.ts       monta Hono, incluido /api/auth/* (Better Auth)
apps/crm/app/(dashboard)/layout.tsx          chequeo de sesión
apps/crm/app/informe/[code]/utils/           geocerca y vigencia (corren en el cliente)
apps/crm/app/(dashboard)/*/data/             datos de ejemplo en lugar de API
```

## Objetivo

```
apps/api/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                         # barrel: export { app, type AppType }
    ├── app.ts                           # composición: middlewares globales + montaje de módulos
    ├── server.ts                        # entrypoint standalone (fase 2, deploy propio)
    │
    ├── core/                            # transversal; sin lógica de negocio
    │   ├── auth/                        # Better Auth: createAuth/getAuth, socialTwoFactorGuard, puerta de invitaciones, requireSession/Admin
    │   ├── context/                     # request → ctx { user, organization, permissions, requestId }
    │   ├── authz/                       # catálogo de permisos, requirePermission(), scopeWhere()
    │   ├── tenancy/                     # resolución de tenant + filtro automático por organización
    │   ├── audit/                       # writeAudit(client, source, event), auditSource, redact
    │   ├── errors/                      # errores de dominio → Problem Details (HTTP)
    │   ├── http/                        # middlewares: cabeceras, CSRF, rate limit, idempotencia, paginación
    │   ├── db/                          # cliente por request y transacción (unit of work)
    │   ├── sequences/                   # correlativos MOV-2026-000123
    │   ├── storage/                     # puerto FileStorage (uno por bucket), adaptador S3 (createS3Storage), getStorage, getStorageEnv y suite de contrato
    │   ├── ids/                         # uuidV7 (cuando la clave del objeto se deriva del id antes del insert)
    │   ├── mail/                        # interfaz Mailer + adaptador SMTP (Mailpit en dev); plantillas en packages/emails
    │   └── platforms/                   # interfaces VideoPlatform/PodcastPlatform + adaptadores (YouTube, Spotify…)
    │
    ├── modules/
    │   ├── identity/
    │   │   ├── users/
    │   │   ├── invitations/                 # crear, listar, reenviar, revocar, vista previa y aceptar
    │   │   ├── roles/                   # roles, permisos y política de sesión por rol
    │   │   └── mfa/
    │   ├── content/
    │   │   ├── posts/                   # blog (+ series y categorías)
    │   │   ├── ministryProfile/         # lado de contenido del ministerio (D-20)
    │   │   ├── events/                  # calendario
    │   │   ├── sermons/
    │   │   ├── podcasts/
    │   │   ├── gallery/
    │   │   └── siteSettings/
    │   ├── treasury/
    │   │   ├── accounts/                # dónde está el dinero (efectivo, caja fuerte, bancos)
    │   │   ├── banks/                   # catálogo por país + bancos propios (D-51)
    │   │   ├── funds/                   # de quién es el dinero: general, ministerio, proyecto (D-49)
    │   │   ├── categories/              # rubros (D-44)
    │   │   ├── movements/
    │   │   ├── periods/                 # cierre mensual (D-46)
    │   │   ├── requests/                # solicitudes de dinero
    │   │   ├── purchaseOrders/          # órdenes de compra y rendición (D-42)
    │   │   ├── budgets/
    │   │   ├── projects/                # incluye aportantes cifrados (D-50)
    │   │   ├── ministryFinance/         # lado financiero del ministerio (D-20)
    │   │   ├── reconciliation/          # extractos bancarios (D-47)
    │   │   └── inventory/
    │   ├── governance/
    │   │   ├── reports/
    │   │   ├── assembly/
    │   │   └── voting/
    │   ├── media/                       # subidas firmadas, finalize, variantes de imagen, descarga privada, purga (data/ domain/ lib/ mappers/ policies/ useCases/ guards/)
    │   ├── audit/                       # consulta del log (solo lectura)
    │   ├── siteKeys/                    # alta, listado y revocación de site keys (domain/ data/ mappers/ useCases/)
    │   ├── editorial/                   # flujo editorial (D-30): domain/ (máquina de estados, availableActions) registry/ guards/ data/ mappers/ notifications/ useCases/
    │   └── public/                      # API pública v1 para sitios (solo contenido publicado): guards/requireSiteKey, useCases, mappers
    │
    └── test/                            # helpers: BD de test, factories, cliente HTTP, matriz de permisos
```

## Anatomía de un módulo (ejemplo: `treasury/movements`)

```
movements/
├── index.ts                             # barrel: exporta solo el router
├── movements.routes.ts                  # controller: HTTP → use case; permiso declarado por ruta
├── movements.policy.ts                  # quién puede qué sobre un movimiento (propiedad, alcance)
├── useCases/                            # un use case por carpeta, con su test
│   ├── createMovement/
│   │   ├── createMovement.ts
│   │   ├── createMovement.test.ts
│   │   └── index.ts
│   ├── editMovement/
│   ├── voidMovement/                    # contra-asiento
│   ├── getMovement/
│   └── listMovements/
├── domain/                              # reglas puras, sin BD ni HTTP
│   ├── movementRules.ts
│   ├── movementRules.test.ts
│   └── index.ts
├── data/                                # consultas Prisma del módulo
│   ├── movementsRepository.ts
│   └── index.ts
└── mappers/                             # fila de BD → DTO del contrato
    ├── toMovementDto.ts
    └── index.ts
```

Reglas:

- Solo se crean las subcarpetas que el módulo necesita (un módulo CRUD simple puede no tener
  `domain/`).
- Un módulo consume a otro **solo** por su barrel, que expone use cases, nunca repositorios.
- `core/` no importa de `modules/`.

## Fuera de `apps/api`, parte del backend

```
packages/db/          schema Prisma + migraciones (se aplican en el deploy, no en runtime)
packages/contracts/   schemas Zod por módulo (inputs y DTOs); la API valida con ellos,
                      el CRM los usa en formularios y de ellos sale el OpenAPI
```

`packages/auth` se eliminó (0.3): el server de Better Auth está en `src/core/auth` (`createAuth()` fábrica, `getAuth()` instancia perezosa) y el cliente en `apps/crm/lib/auth`.

## Archivos y multimedia (`core/storage` + `modules/media`)

- `core/storage`: `FileStorage` (puerto por bucket), `createS3Storage` (único adaptador, `aws4fetch`:
  `fetch` + SigV4, corre en Node, Vercel y Bun), `getStorage("public" | "private")` (memoizado, cada
  bucket con su propia key) y `getStorageEnv()` (esquema propio y perezoso: el CLI `invite` y el resto
  de la API no necesitan credenciales de S3). `fileStorageContract` exporta la suite de contrato.
- `modules/media`: `requestUpload`, `finalizeUpload`, `issueDownload` y `purgeStaleUploads`.
  `media.routes.ts` solo exige sesión (`requireSession`, que también es su declaración de acceso): el
  permiso real lo decide el **propósito** del archivo dentro del use case. `internal.routes.ts`
  (`GET /internal/media/purge`) se protege con `requireCronSecret`, sin sesión.
- **Cuándo agregar un propósito**: cuando un módulo nuevo necesita archivos (acta en Word, comprobante
  de otra orden, imagen de otro contenido). Se agrega una entrada a `MEDIA_PURPOSES`
  (`packages/contracts/src/media`) con visibilidad, tipos, tamaño máximo y permisos, y se agrega al enum
  `MediaPurpose` de Prisma con su migración. Si el tipo es nuevo, se agrega su firma a
  `detectContentType`. No hace falta un recurso `media` en el catálogo de permisos.
- Las claves siguen `<organizationId>/<fileId>` (original, bucket privado) y
  `<organizationId>/<fileId>/<ancho>.<formato>` (variantes, bucket público).
