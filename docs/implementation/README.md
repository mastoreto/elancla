# Implementación — El Ancla (web + CRM)

Punto de entrada para personas y agentes que implementen funcionalidad real en el monorepo. Antes de
escribir código, leé este archivo, el relevamiento y las decisiones aceptadas que toquen tu tarea.

## Documentos

| Archivo | Para qué |
|---|---|
| [`00-relevamiento.md`](./00-relevamiento.md) | Estado del repo al arrancar: qué existe, qué es maqueta, qué falta |
| [`decisions.md`](./decisions.md) | Registro de decisiones (propuestas, aceptadas, descartadas) |
| [`architecture/api-structure.md`](./architecture/api-structure.md) | Estructura de la API: hoy → objetivo, anatomía de módulos |
| [`architecture/backend.md`](./architecture/backend.md) | Capas, patrones, SOLID, estándar de consultas, consumo desde el CRM |
| [`architecture/security.md`](./architecture/security.md) | Seguridad de comunicaciones API ↔ CRM ↔ web, cabeceras, secretos, logs, tests |
| [`architecture/multi-site.md`](./architecture/multi-site.md) | Preparación para conectar otras webs |
| [`phases/`](./phases/README.md) | Fases de ejecución por área, con subfases; base para los planes de implementación |
| [`plans/`](./plans/) | Planes de implementación detallados por subfase (se escriben antes de construir) |


## Fuentes

- ESRE de tesorería: [`apps/crm/docs/esre.pdf`](../../apps/crm/docs/esre.pdf). Es la base funcional,
  pero el sistema cambió bastante. Ante conflicto manda lo aceptado en `decisions.md`.
- Reglas de código y estructura: [`CLAUDE.md`](../../CLAUDE.md).
- Idioma: documentación y conversación en español; **todo nombre de código** (carpetas, archivos,
  funciones, variables, tipos, rutas de API) en inglés.

## Prioridades acordadas

1. **Base técnica** (fase 0): backend, seguridad, auth y RBAC (bloquean todo lo demás).
2. **Contenidos**: la web sale primero.
3. **Tesorería** (incluye inventario).
4. **Gobierno**: informes, asamblea, votaciones (evaluar si conviene construir votaciones).
