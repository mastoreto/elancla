# CRM migration - Phase 5 (menu sections, pass 1)

Goal: every item in the sidebar menu shows the page header, copy and key blocks of its board in the design artifact.

## Done in this pass
| Menu item | Board | Change |
|---|---|---|
| Resumen | `crm-s-resumen` | greeting and copy, three KPIs (saldo total, ofrendas del mes, egresos del mes), new weekly offerings chart (recibido vs meta), reconciliation chip (conciliado, por conciliar, observado) in recent movements |
| Movimientos | `crm-s-movimientos` | design page header and copy |
| Solicitudes | `crm-s-solicitudes` | design page header and copy with the pending, approved and rejected counts |
| Boletas | `crm-s-boletas` | design page header and copy |
| Comprobantes | `crm-s-comprobantes` | design page header and copy |
| Proyectos | `crm-s-proyectos` | design page header and copy |
| Presupuestos | `crm-s-presupuestos` | design page header and copy |
| Informes | `crm-s-informes` | page header, metric strip (totales, listos, pendientes) replacing the old hero |
| Votaciones | `crm-s-votaciones` | design page header and copy |
| Sitio web | `crm-s-sitio-web` | design page header |
| Configuración | `crm-s-config-iglesia` | design page header and copy |
| Blog, Podcasts, Ministerios, Inventario, Asamblea | | already on the design header (earlier phases) |

## Pending (next passes)
- Per-board body details: filters with the ⌘K search, card/table toggles, pagination footer, side panels (solicitud detail, boleta preview, comprobante justification), kanban of requests under review, project and budget alert states, vote moderation views.
- Configuración subpages (users, roles, notifications) and the "General" page, which is an empty placeholder with no board.
- Chart data and reconciliation status are seed data from the boards; wire them to the API when it exists.
