# Fidelity F2 — Treasury screens

Ported from the board code: `crm-s-resumen`, `crm-s-solicitudes`, `crm-s-solicitud-detalle`, `crm-s-movimientos`, `crm-s-movimiento-nuevo`, `crm-s-boletas`, `crm-s-comprobantes`.

- **Resumen**: header, balance cards, recent movements, pending approvals, project budgets, quick actions and treasury notes, each in its own component under `dashboard/components`.
- **Solicitudes**: board toolbar (search, status chips with counts, ministry filter), table card with avatars, status pills and quick approve/reject buttons, board pagination, and the 440 px detail drawer with budget lookup, timeline and comment box. The date-range filter was dropped because the board has none.
- **Movimientos**: toolbar with currency, date range and clear, table card with type pills and signed amounts, and the "Nuevo movimiento" dialog rebuilt on the board form (also used by the project screens).
- **Boletas / Comprobantes**: list card plus side panel (file preview and facts / guidance and justification). The view modal was replaced by the side panel; create, edit and delete keep their dialogs. A trash button was added to the panels because the board has no delete entry point and the old screens had one.
- Shared board primitives live in `components/dashboard/board/` (button, card, pill, bubble, search field, filter chip/select, date-range pill, pagination, field, dialog). They are copied identically in every phase branch so the PRs merge in any order.
- Seed data in `lib/data.ts` now matches the boards (Spanish names, Spanish movement concepts).
- Amounts are written "$U 15.000" / "USD 320" through `lib/format-money.ts`.
- Tests: `greeting`, `request-list`, `movement-list`, `receipt-list`, `voucher-list`, `voucher-form`.
