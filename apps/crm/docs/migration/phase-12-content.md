# CRM migration - Phase 12 (content)

UI only, sample data.

## Done
- Blog, podcasts and website: long classNames moved to the style-object convention.
- New section **Sermones** (`/sermons`, `/sermons/new`) from the `crm-s-sermones` and `crm-s-sermon-nuevo` boards: metric strip, YouTube live banner, search, status tabs with counts, table, pagination footer, and the create form with Zod validation (title, preacher, passage, date and a valid YouTube link). Saving is simulated: it validates and returns to the list. Registered in `lib/church.ts`, the route meta and the sidebar.
- Shared `components/list-pagination.tsx`; Solicitudes keeps its own copy until the cleanup pass.

## Pending
- Draft saving and thumbnail upload need the API.
