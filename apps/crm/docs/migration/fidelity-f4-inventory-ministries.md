# Fidelity F4 — Inventory and ministries

Ports the `crm-s-inventario*` and `crm-s-ministerio*` boards:

- Inventory: list (table/cards, category chips, summary cards), detail (hero with status menu,
  specs, acquisition, history), create/edit form, lend and delete dialogs.
- Ministries: list (cards/table, summary), detail (dark hero, leadership, budget), create/edit
  form and delete dialog.

New shared primitives under `components/dashboard/board/`: `board-form` (form card, inputs, selects,
switch row) and `board-confirm-dialog`. Seed data only; no Prisma changes.
