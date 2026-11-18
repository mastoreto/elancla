# Phase 13 — Ministries and inventory (UI only)

Seed data only; saving validates with Zod and returns to the list.

- Shared `components/confirm-delete-dialog.tsx` (AlertDialog with optional safer alternative).
- Ministries: list cards link to detail; `new`, `[id]`, `[id]/edit`; delete confirm.
- Inventory: `new`, `[id]`, `[id]/edit`; lend dialog (borrower, from, return date, note); delete dialog with "Dar de baja" alternative; table rows link to detail.
- Utils with tests: `getMinistryDetail`, `getInventoryDetail`.
