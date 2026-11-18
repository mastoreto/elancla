# Estructura de la API (`apps/api`)

**Aceptada** (D-24). Toda implementación del backend sigue esta estructura. Capas, patrones y estándar
de consultas: [`backend.md`](./backend.md). Seguridad: [`security.md`](./security.md).

Nombres de código (carpetas, archivos, funciones, variables, tipos) **siempre en inglés**. Los
comentarios de este documento están en español solo como explicación.

## Hoy: dónde está el "backend"

No existe como tal; está repartido:

```
packages/auth/src/server.ts                  instancia de Better Auth (email + contraseña)
packages/auth/scripts/seed-admin.ts          alta del primer admin
packages/db/prisma/schema.prisma             schema (sin migraciones)
packages/db/src/index.ts                     cliente Prisma
apps/crm/app/api/auth/[...all]/route.ts      único endpoint real (Better Auth)
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
    │   ├── auth/                        # Better Auth: Google, invitaciones, 2FA, rate limit
    │   ├── context/                     # request → ctx { user, organization, permissions, requestId }
    │   ├── authz/                       # catálogo de permisos, requirePermission(), scopeWhere()
    │   ├── tenancy/                     # resolución de tenant + filtro automático por organización
    │   ├── audit/                       # writeAudit(tx, ctx, event)
    │   ├── errors/                      # errores de dominio → Problem Details (HTTP)
    │   ├── http/                        # middlewares: cabeceras, CSRF, rate limit, idempotencia, paginación
    │   ├── db/                          # cliente por request y transacción (unit of work)
    │   ├── sequences/                   # correlativos MOV-2026-000123
    │   ├── storage/                     # interfaz FileStorage + adaptadores B2 y local
    │   ├── mail/                        # interfaz Mailer + adaptadores
    │   └── platforms/                   # interfaces VideoPlatform/PodcastPlatform + adaptadores (YouTube, Spotify…)
    │
    ├── modules/
    │   ├── identity/
    │   │   ├── users/
    │   │   ├── invitations/
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
    │   ├── media/                       # subidas firmadas, finalize, variantes de imagen
    │   ├── audit/                       # consulta del log (solo lectura)
    │   └── public/                      # API pública v1 para sitios (solo contenido publicado)
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

`packages/auth` se elimina: el server de Better Auth pasa a `src/core/auth` y el cliente al CRM.
