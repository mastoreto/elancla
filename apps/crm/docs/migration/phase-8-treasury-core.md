# CRM migration - Phase 8 (treasury core)

Scope is UI only: layout, UI state and sample data. No Prisma or API changes (decision from the team).

## Done
- `/general` page, menu item and route registration removed (no board, no owner).
- Solicitudes rebuilt on the `crm-s-solicitudes` and `crm-s-solicitud-detalle` boards under `app/(dashboard)/requests/`: status tabs with counts, search, ministry and date filters, table with leader avatars, pagination footer ("Mostrando 1-5 de N"), side detail panel (Sheet) with amount, history and approve/reject. Thin `page.tsx`, route-local `components/` and `utils/`.
- Boletas and Comprobantes: all long class strings moved to the style-object convention.
- `StatusBadge` and `RequestFormModal` converted to the convention.

## Pending in this area
- Boletas: pagination footer and the vouchers/receipts filters with the ⌘K hint.
- Movimientos: pagination and reconciliation filters.
