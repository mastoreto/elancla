# Phase 17 — Cleanup

- All remaining long inline `className` strings (including `cn(...)` cases) moved to style objects; the Biome plugin `no-long-inline-classname` is now an error and the CRM reports 0 plugin findings.
- `src/componentes/dashboard` moved to `components/dashboard`; imports updated.
- Segmented toggles keep `role="group"` with a documented Biome suppression.
- `src/components/` (DataTable, RichTextEditor) moved into `components/`. Pending: i18n (es/en/pt) not started.
