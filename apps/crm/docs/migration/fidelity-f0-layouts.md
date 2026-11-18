# Fidelity F0 — Layouts

Rebuilds the app shell from the `crm-navegacion` board.

- Dark gradient frame (`--grad-marco`) with the sidebar inside it and the content as a rounded light panel.
- Sidebar: iEkklesia mark, sections Tesorería / Gobierno / Contenido / Sistema, request badge, month-close card, user chip.
- Topbar: route title, search pill, primary action, message / notification / more buttons.
- `components/dashboard/route-meta.ts` holds the route titles and primary actions.
- New gradient tokens in `globals.css`: `--grad-granada`, `--grad-oro`, `--grad-avatar`, `--grad-marco`.
- `lib/dev-auth-bypass.ts`: `CRM_DEV_SKIP_AUTH=1` skips the session guard in `next dev` only, to capture protected routes.

Page headers inside each screen still duplicate the topbar title; they are aligned screen by screen in the next phases.
