# CRM migration - Phase 4 (new sections)

Adds the first three sections that exist in the design artifact but not in the CRM yet. They follow the boards `crm-s-ministerios`, `crm-s-inventario` and `crm-s-asamblea-lista`.

| Route | Sidebar group | What it has |
|---|---|---|
| `/ministries` | Contenido | metric strip, card grid with leader, volunteers, visibility on the site and budget execution |
| `/inventory` | Gobierno | metric strip, items table with code, category, location, quantity, status badge and value |
| `/assembly` | Gobierno | metric strip, reports table with access code, status, validity window, place and accesses |

Each route is a folder with a thin `page.tsx` plus `components/`, `data/`, `types/` and `utils/` (CLAUDE.md structure). Routes are registered in `lib/church.ts`, the sidebar and the header route meta, so the church-slug rewrite in `middleware.ts` works for them.

## Data
These pages use seed data copied from the boards, the same approach the existing podcasts and general pages use. No Prisma models were added: `packages/db` is shared with `apps/web` and with the parallel work on this repository, so schema changes should be agreed first.

## Still missing from the artifact (next iterations)
- Detail, create, edit and delete flows for ministries and inventory (`crm-s-ministerio-*`, `crm-s-inventario-*`), including the loan flow.
- Assembly: new report, projection, open/closed panel and low-down flows (`crm-s-asamblea-*`) and the public views (`crm-s-publico-*`).
- Sermons (`crm-s-sermones`, `crm-s-sermon-nuevo`), configuration subpages (church, roles, users, notifications), login screen, and the email templates board.
- Search, filters and card/table toggles shown in the boards; Prisma models and server actions for the three new sections.
- i18n of the new screens (es, en, pt) once the CRM gets an i18n setup.
