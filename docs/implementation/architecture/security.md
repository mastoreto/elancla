# Seguridad de comunicaciones: API ↔ CRM ↔ Web

Decisiones de origen: D-07, D-08, D-10, D-11, D-16, D-21, D-24, D-25.

## Topología

```
                    Navegador (miembro con sesión)
                               │ HTTPS, cookie de sesión host-only
                               ▼
  crm.<dominio> ──────── Next (CRM) ── /api/* ──► Hono (API) ──► Supabase Postgres (TLS)
                               │  RSC: llamada en proceso            │
                               │  reenviando cookies                 └──► B2 privado (URL firmada)
                               │
  <dominio> ─────────── Astro (web) ── server-to-server ──► /public/v1 (API)
                    Navegador (visitante)   Authorization: Bearer <site key>
                    nunca llama a la API
                    (excepto informe de asamblea y subidas firmadas)

  media.<dominio> ───── Cloudflare CDN ──► B2 público
```

- **Fase 1**: la API se monta dentro del CRM. Mismo origen: sin CORS, cookies host-only.
- **Fase 2** (API en su propio deploy): el CRM sigue exponiendo `/api/*` con un rewrite de Vercel
  hacia la API. El navegador sigue viendo un solo origen; no se abren cookies a `.<dominio>` ni CORS
  con credenciales.

## 1. CRM ↔ API (usuarios autenticados)

| Control | Implementación |
|---|---|
| Transporte | Solo HTTPS; HSTS `max-age=63072000; includeSubDomains; preload` |
| Sesión | Cookie de Better Auth `__Secure-`, `HttpOnly`, `Secure`, `SameSite=Lax` (lo exige el callback de Google), host-only |
| Validación de sesión | En **cada** request de la API contra BD (con caché de cookie corta de Better Auth, ≤ 5 min) |
| Política por rol | D-16, la más restrictiva entre los roles del usuario. Duración máxima: `requireSession` revoca la sesión y responde 401 si `now - session.createdAt` la supera (en cada request). Sesión no persistente: el plugin `roleSessionPolicy` (`core/auth`) reescribe tras cada login (`/sign-in/email`, `/sign-in/social`, `/callback/:id`, `/two-factor/verify-*`) la cookie de sesión sin `Max-Age`/`Expires` y fija la cookie `dont_remember` de Better Auth, que también mantiene sin vencimiento los refrescos posteriores. Verificado contra Better Auth 1.7.25 y cubierto de punta a punta (incluido el login con 2FA) |
| Re-autenticación | `freshAge` para operaciones sensibles: aprobar, exportar, cambiar roles, configurar MFA |
| CSRF | Mutaciones solo con `Content-Type: application/json` (si no, 415); toda mutación con `Origin` distinto de `CRM_ORIGIN` o con `Sec-Fetch-Site` distinto de `same-origin`/`none` → 403. `hono/csrf` solo mira tipos de formulario y acepta si pasa *cualquiera* de los dos chequeos, por eso hay un chequeo propio previo (`core/http/csrf`). Requests sin ninguno de los dos headers (clientes no navegador, llamadas en proceso) pasan: no llevan cookies ambientales. Better Auth valida `trustedOrigins` en sus rutas |
| CORS | Fase 1: no hay (mismo origen). Nunca `*`, nunca credenciales a orígenes no listados |
| Autorización | `requirePermission()` / `allowAnySession` / `allowPublic` declarado en cada ruta + policy de recurso en el use case + `scopeWhere` en las consultas. Una ruta sin declaración hace fallar el test de introspección del router (`app.test.ts`); no es un chequeo de arranque. El CRM oculta menú y secciones con `GET /me/permissions`, pero la API es la autoridad |
| Entrada | Zod `.strict()`; tamaño máximo de body; fechas y montos con formato estricto |
| Salida | Solo DTOs; `Cache-Control: private, no-store` en toda respuesta autenticada |
| Rate limit | Better Auth (login, 2FA) con almacenamiento en BD; los endpoints públicos propios (vista previa y aceptación de invitación) usan `core/http/rateLimit` sobre la misma tabla; reglas de Vercel Firewall por ruta sensible. Ambos se llavean por la IP de `X-Forwarded-For`: el proxy de producción debe sobrescribirla (0.8) |
| 2FA en login social | El plugin `twoFactor` oficial solo intercepta login por credencial. `socialTwoFactorGuard` (`core/auth`) hace lo mismo tras `/callback/:id` y `/sign-in/social`: borra la sesión recién creada y emite la cookie `two_factor`, de modo que `verifyTotp`/`verifyBackupCode` terminan el login. Replica comportamiento de Better Auth 1.7.25; un test lo cubre de punta a punta |
| Alta de usuarios | `POST /api/auth/sign-up/email` público responde 404. El único alta es una invitación pendiente: `databaseHooks.user.create.before` rechaza cualquier otro caso (email o Google). Vínculo de cuentas solo explícito |
| Operaciones sensibles | `freshAge` de 10 min: vincular proveedor, configurar 2FA y crear contraseña exigen sesión reciente (`freshSessionGuard`, `requireFreshSession`) |
| Errores | Problem Details sin detalles internos; `requestId` para correlacionar |

## 2. Web ↔ API (contenido público)

- La web llama a `/public/v1/...` **desde el servidor** (SSR), nunca desde el navegador del
  visitante.
- Se identifica con una **site key** por sitio: `Authorization: Bearer sk_<siteId>_<secreto>`.
  - Se guarda solo el hash (SHA-256) en BD; el secreto se muestra una vez al crearla.
  - Alcance mínimo: leer contenido **publicado** de su organización. No puede escribir ni ver
    borradores.
  - Rotable sin downtime (dos claves activas durante la rotación) y revocable.
  - Vive en variables de entorno del servidor del sitio (`SITE_API_KEY`, nunca `PUBLIC_`).
- El contenido publicado es público por naturaleza: la key no protege un secreto, sirve para
  **identificar el sitio** (qué organización, qué secciones), limitar abuso y poder cortar el acceso.
- Respuestas con `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. Variación por
  iglesia incluida en la URL (`/public/v1/:churchSlug/...`), así el caché nunca mezcla iglesias.
- Los DTOs públicos son un subconjunto explícito: nunca incluyen IDs de usuarios, emails, notas
  internas ni datos de tesorería.

## 3. Navegador ↔ API sin sesión (casos acotados)

**Informe de asamblea** (D-11):

1. La página `/informe/[code]` no contiene datos del informe.
2. El navegador pide ubicación y hace `POST /public/v1/assembly-reports/:code/open` con coordenadas.
3. La API valida: código con entropía alta (≥ 128 bits, no adivinable), vigencia, geocerca en
   servidor, rate limit por IP y por código.
4. Si pasa, devuelve el informe con `Cache-Control: no-store` y lo audita (código, hora, distancia,
   IP, user agent). Si no, 403 genérico, sin decir qué falló.
5. La página de informe es la única con `Permissions-Policy: geolocation=(self)`.

**Escrituras anónimas desde la web** (visitas D-32, newsletter D-34):

1. El navegador nunca llama a la API: envía a un endpoint del **mismo dominio de la web**
   (`/api/views`, `/api/newsletter`), que reenvía a la API desde el servidor con la site key.
2. Visitas: `sendBeacon` tras cargar el artículo; deduplicación diaria con hash de IP + user agent +
   sal que rota cada día y **no se guarda** (no hay forma de recuperar la IP); se descartan bots
   conocidos; rate limit. Solo se persiste el conteo agregado por artículo y día.
3. Newsletter: doble opt-in, rate limit por IP, respuesta idéntica exista o no el email.

**Subida de archivos** (D-06):

1. El CRM pide `POST /api/media/uploads` (autenticado y con permiso) con tipo y tamaño declarados.
2. La API genera la clave del objeto (el cliente nunca elige la ruta) y una URL prefirmada de PUT
   que vence en 5 min, atada a tipo y tamaño.
3. El navegador sube directo a B2.
4. `POST /api/media/uploads/:id/finalize`: la API verifica el objeto (tamaño, tipo real por magic
   bytes) y recién ahí lo registra como `File` utilizable. Lo no finalizado se borra por cron.
5. Descargas privadas: URL firmada de 60 s emitida tras autorizar y auditar.

## 4. Cabeceras

| Cabecera | CRM | Web |
|---|---|---|
| `Strict-Transport-Security` | sí | sí |
| `Content-Security-Policy` | estricta con nonce (generado en `proxy.ts`), `frame-ancestors 'none'` | estricta; orígenes de YouTube/Spotify/media explícitos |
| `X-Content-Type-Options: nosniff` | sí | sí |
| `Referrer-Policy: strict-origin-when-cross-origin` | sí | sí |
| `Permissions-Policy` | todo deshabilitado salvo geolocalización en `/informe` | ya existe en `vercel.json` |
| `Cross-Origin-Opener-Policy: same-origin` | sí | sí |
| `X-Robots-Tag: noindex` | sí (todo el CRM) | no |

## 5. Secretos y conexiones

- Variables validadas al arrancar por `packages/env`, con un schema **por app** (la web no conoce los
  secretos de la API y viceversa). Faltante = la app no arranca.
- Ningún secreto con prefijo `NEXT_PUBLIC_` / `PUBLIC_`.
- Postgres: la API usa el rol `app_runtime` (sin DDL, sin `UPDATE`/`DELETE` en `AuditLog`) por el
  pooler; las migraciones usan `app_migrator` por conexión directa, solo en el pipeline de deploy.
- RLS activado en todas las tablas sin políticas para roles de la Data API (D-21).
- B2: una key de aplicación por bucket con permisos mínimos.
- Rotación documentada de: `BETTER_AUTH_SECRET`, credenciales de Postgres, keys de B2, site keys.

## 6. Logs

- **Auditoría** (D-10): en BD, durable, append-only. Es la fuente de verdad de "quién hizo qué".
- **Logs de aplicación**: JSON estructurado con `requestId`, ruta, status, duración y usuario
  (ID, no email). Redacción automática de cookies, `Authorization`, tokens y montos de cuerpos. Sirven
  para depurar, no como registro legal (la retención de Vercel es corta).

## 7. Tests de seguridad obligatorios (bloquean el merge)

- Matriz de autorización completa por HTTP (rol × ruta × alcance).
- Cada ruta privada sin sesión → 401; con sesión sin permiso → 403/404.
- Aislamiento de tenant: datos de una organización de prueba B nunca aparecen para A.
- CSRF: mutación con `Origin` ajeno o `Content-Type` de formulario → rechazada.
- Site key: sin key / revocada / de otro sitio → 401; nunca devuelve borradores.
- Informe de asamblea: sin coordenadas o fuera de radio → 403 y ningún dato en la respuesta.
- Respuestas: ningún DTO expone campos fuera del contrato (snapshot del schema).
