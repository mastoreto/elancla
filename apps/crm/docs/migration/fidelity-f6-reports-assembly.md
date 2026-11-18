# Fidelity F6 — Reports and assembly

Ports the `crm-s-informes*`, `crm-s-asamblea-*` and `crm-s-publico-informe` boards.

## Reports (`app/(dashboard)/reports`)
- List: tabs (generated / pending / catalog), search, cards/list toggle, template catalog.
- Detail: hero bar, KPI cards, bar chart, ministry donut, movements table. All reports share the board's sample figures (`data/report-seeds.ts`).
- New: template picker, scope fields, output blocks/format, sticky dark summary. "Generar informe" is UI only.
- The old filter/export components were removed.

## Assembly (`app/(dashboard)/assembly`)
- List with stat cards, status chips, table and pagination.
- Panel with three modes derived from the report status: open, closed (not yet enabled) and ended. Enable, disable and take-down are local state.
- Take-down dialog asks for the access code.
- Publish form follows the four-step board (report, code, validity, place) with a summary panel; `utils/assembly-code.ts` generates codes.
- Projection is the presenter view with the QR veil while closed.

## Public report (`app/informe/[code]`)
Responsive attendee view reusing the report chart components.

Shared primitives under `components/dashboard/board/` are identical across phase branches.
