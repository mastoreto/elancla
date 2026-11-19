# Multi-sitio: cada iglesia, su sitio

**Aceptada** (D-25). Multi-sitio es la cara pública del multitenant (D-02): cada iglesia (tenant)
tiene **un** sitio web propio. Hoy existe una sola iglesia, El Ancla. Se prepara el modelo y el
contrato; el alta de iglesias y una plantilla web reutilizable se construyen después de que el
sistema esté 100 % operativo en El Ancla.

## Modelo

```
Organization (iglesia, tenant)          slug único (p. ej. "el-ancla")
 ├── SiteSettings      1:1             dominio, estado online/maintenance/closed, contacto, redes,
 │                                     horarios, SEO, secciones habilitadas
 ├── SiteApiKey        1:N             claves con las que su web lee la API (rotación = 2 activas)
 └── contenido                         Post, Event, Ministry, Gallery… (todo con organizationId)
```

- No hay tabla `Site`: la relación iglesia ↔ sitio es 1:1.
- `SiteSettings` deja de ser singleton (`id = "singleton"`) y pasa a tener `organizationId` único.

## Contrato público

- Rutas: `/api/public/v1/:churchSlug/...` (settings, posts, events, ministries, sermons, gallery…; en 1.1 solo `settings`, el resto llega con su subfase).
- La site key (`sk_<keyId>_<secreto>`) identifica a la iglesia; el `churchSlug` de la URL **debe coincidir** con la key
  (si no, 401). El slug va en la URL porque el CDN cachea por URL: así dos iglesias nunca comparten
  una respuesta cacheada.
- Solo contenido publicado de esa iglesia. Nunca borradores, datos internos ni de tesorería.
- OpenAPI público versionado. Cambio incompatible → `/public/v2`; `v1` se mantiene hasta migrar a
  todos los sitios.

## Consumidores

- `packages/content` es el **SDK**: cliente tipado del contrato público + helpers (fechas, rich text
  a HTML). La web de El Ancla lo usa; la web de otra iglesia lo reutiliza o genera su cliente desde
  el OpenAPI.
- Regla para `apps/web` desde ya: **ningún dato de la iglesia hardcodeado** en componentes (nombre,
  dirección, redes, horarios, coordenadas). Todo sale de `SiteSettings`. Las secciones
  deshabilitadas no se enrutan.
- Queda fijo en la web de El Ancla: diseño, doctrinas, confesión de fe y textos de estructura
  (i18n). Extraer un tema reutilizable se decide cuando exista la segunda iglesia.

## Notificación de cambios (futuro)

Cuando haya sitios que cacheen más agresivo: webhooks salientes firmados (HMAC-SHA256 con
timestamp, tolerancia 5 min, formato Standard Webhooks) al publicar contenido. Hasta entonces alcanza
con `s-maxage` corto + `stale-while-revalidate`.
