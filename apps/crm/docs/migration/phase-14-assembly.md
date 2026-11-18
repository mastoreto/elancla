# Phase 14 — Assembly (UI only)

- Dashboard: `new` (publish form), `[id]` (panel: open/close, write off, access data, QR), `[id]/projection` (full-screen QR).
- Public route `/informe/[code]` (outside the dashboard, allowed without session in `middleware.ts`) renders one of: visible report, not yet available, expired, written off, invalid code. State is derived by `getPublicAccessState`.
- `AccessQr` is a deterministic placeholder pattern; swap for a real QR generator when the API exists.
