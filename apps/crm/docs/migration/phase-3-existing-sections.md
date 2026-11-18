# CRM migration - Phase 3 (existing sections)

Scope of this PR: bring every existing section onto the design system colors without redesigning page layouts.

## What changed
- 30 files in `app/`, `components/` and `src/` stopped using hardcoded Tailwind palette colors (`emerald`, `amber`, `rose`, `sky`, `violet`, `slate`...). They now use the semantic tokens from phase 2:
  - growth, income, approved: `income` / `success-surface` (vida)
  - pending, in review, attention: `warning` / `warning-surface` / `oro`
  - expense, rejected, alerts: `expense` / `accent` / `granada`
  - neutral and informational chips: `secondary` / `secondary-foreground` / `border`
- Redundant `dark:` variants were removed because the tokens already adapt to dark mode.
- Exception: the social links section keeps brand colors of each network (Instagram, YouTube, ...).

## Sections touched
dashboard, movements, requests, projects, budgets, receipts, vouchers, reports, voting, settings (currencies, notifications, users, bank accounts), website, blog, podcasts, general, plus shared components (status badges, project and request tables, filters, timelines).

## Not in this PR (needs a design review with the artifact open)
- Page by page layout fidelity against `crm-s-*` boards (spacing, panel composition, the highlighted granada card "one per view", glass panels).
- i18n extraction of hardcoded Spanish text (765 Biome `noJsxLiterals` warnings) and the folder-per-component restructure required by CLAUDE.md. Both are better done per section together with phase 4 so each screen is touched once.
- Mapping of five distinct hues (blue, sky, violet, slate, indigo) to one neutral tone is intentional ("few colors"), but check places where hue separated categories (currencies, user roles).
