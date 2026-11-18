# Fidelity F7 — Content (sermons, blog, podcasts, website)

Screens ported 1:1 to the `crm-s-*` boards. UI only, seed data, no Prisma changes.

## Screens
- `/sermons` list + `/sermons/new` (board `crm-s-sermones`, `crm-s-sermon-nuevo`)
- `/blog` list + `/blog/new` (board `crm-s-blog`, `crm-s-blog-nuevo`)
- `/podcasts` list + `/podcasts/new` (board `crm-s-podcasts`, `crm-s-podcast-nuevo`)
- `/website` (board `crm-s-sitio-web`)

## Shared code
- `components/dashboard/content/`: status pill, list toolbar, table, section tabs, image dropzone, chip input, form actions (+ barrel).
- `lib/format-content.ts`: short date and count formatters.
- `components/RichTextEditor.tsx` restyled to the board toolbar.
- Board primitives in `components/dashboard/board/` are copied unchanged from F4.

## Notes
- Row "edit" buttons link to the `new` form because no edit routes exist yet.
- Delete actions use `BoardConfirmDialog` and remove the row from local state.
- Website keeps its server actions: status saves on selection, "Sobre nosotros" and social links have their own save button. "Sobre nosotros" is now a plain textarea; previously stored HTML is shown stripped of tags.
