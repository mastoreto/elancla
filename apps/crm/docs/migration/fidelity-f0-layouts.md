# Fidelity F0 — Layouts

Rebuilds the app shell from the `crm-navegacion` board.

- Dark gradient frame (`--grad-marco`) with the sidebar inside it and the content as a rounded light panel.
- Sidebar: iEkklesia mark, sections Tesorería / Gobierno / Contenido / Sistema as in the screen boards (Contenidos group with Podcasts, Sermones, Ministerios and a "Pronto" Galería), request badge and user chip.
- Topbar: route title, search pill and message / notification / more buttons; each screen owns its own header and actions.
- `components/dashboard/route-meta.ts` holds the route titles and primary actions.
- New gradient tokens in `globals.css`: `--grad-granada`, `--grad-oro`, `--grad-avatar`, `--grad-marco`.
- `lib/dev-auth-bypass.ts`: `CRM_DEV_SKIP_AUTH=1` skips the session guard in `next dev` only, to capture protected routes.

Page headers inside each screen still duplicate the topbar title; they are aligned screen by screen in the next phases.
