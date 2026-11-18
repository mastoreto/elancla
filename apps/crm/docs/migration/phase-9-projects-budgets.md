# CRM migration - Phase 9 (projects and budgets)

UI only, sample data.

## Done
- Projects page rebuilt around a thin `page.tsx`: `ProjectsPageContent`, `ProjectsStats` (metric strip with active, planning and budget totals), accessible table/cards toggle (`aria-pressed`), and `ProjectsGrid`. List filtering, sorting, stats and the budget alert rule (near limit at 80 %, over budget) live in `projects/utils` with `bun test` coverage.
- All project-only components moved from `components/` to `projects/components/` (card, table, filters, form modal, summary, documents, timeline, movements, status badge, budget bar), per the folder rule in CLAUDE.md. `ProjectFilters` types moved to `projects/types`.
- Long classNames of projects and budgets moved to the style-object convention. Test files are excluded from `tsc` because `bun:test` types are not installed.

## Pending
- Project detail (`crm-s-proyecto-detalle`) body, budget alert states on the budgets page, and the remaining `cn(...)` cases in `project-summary`, `project-form-modal` and `project-timeline`.
