# Fases de implementación

Cada subfase es la base de un plan de implementación. Antes de empezar una, leé su archivo, las
decisiones que cita y la arquitectura que enlaza.

## Orden y dependencias

```
0 Base técnica ──► 1 Contenidos ──► 2 Tesorería ──► 3 Gobierno
   (bloquea todo)    (la web sale      (incluye         (3.0 decide si
                      primero)          inventario)      se hacen votaciones)
```

| Fase | Subfases | Depende de |
|---|---|---|
| [0 — Base técnica](./0-foundations/) | 0.1 BD → 0.2 esqueleto API → 0.3 auth → 0.4 RBAC; 0.5 auditoría y 0.6 archivos tras 0.2; 0.7 tests/CI arranca con 0.2; 0.8 movida a 1.10 | — |
| [1 — Contenidos](./1-content/) | 1.0 mapa (análisis, en conjunto) → 1.1 API pública + SDK → 1.2 flujo editorial → 1.3 a 1.9 (1.6 calendario completa los horarios de 1.5; 1.9 newsletter tras 1.4; **1.8 galería diferida**, fuera de la primera versión) → **1.10 lanzamiento** (operación, infraestructura, primer release y `main`) al final | 0 |
| [2 — Tesorería](./2-treasury/) | 2.1 base contable → 2.5 proyectos y 2.4 presupuestos → 2.2 solicitudes → 2.3 órdenes y rendición; 2.6 conciliación tras 2.1; 2.7 informes al final; 2.8 inventario | 0 (2.4 y 2.8 usan `Ministry` de 1.5) |
| [3 — Gobierno](./3-governance/) | 3.0 evaluación (completada) → 3.1 informes de asamblea → 3.2 padrón, acreditación y votaciones (bases definidas, puede quedar fuera de la primera versión) | 2.7 |

## Plantilla de subfase

Todas las subfases tienen las mismas secciones:

1. **Objetivo**
2. **Depende de**
3. **Alcance**
4. **Fuera de alcance**
5. **Requisitos ESRE / decisiones**
6. **Cambios de BD**
7. **Endpoints y permisos**
8. **Tests obligatorios**
9. **Terminado cuando**

## Definición de terminado (toda subfase)

- Endpoints con permiso declarado y filas en la matriz de autorización.
- Mutaciones auditadas dentro de la transacción.
- Tests unitarios (dominio) e integración (HTTP contra Postgres real) en verde en CI.
- `bun run check` y `bun run check-types` limpios.
- Pantallas del CRM conectadas a la API: ningún seed de `data/` en la sección tocada.
- Textos visibles vía i18n; nombres de código en inglés.
- `architecture/` y `decisions.md` actualizados si algo cambió.
