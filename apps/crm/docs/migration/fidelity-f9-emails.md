# Fidelity F9 — Emails

The four react-email templates were rebuilt to match `crm-emails`: invitation, password reset, monthly report and notices.

- `emails/theme.ts`: tokens as literals, font stacks with fallbacks, shared inline styles.
- `emails/components/`: `EmailLayout` (church name first, iEkklesia signature, footer links), `EmailHero` (tinted band + glyph badge), `EmailButton`, `EmailDetails`, `EmailBar`, `EmailFallbackLink`.
- `emails/templates/`: one file per email. `NoticeEmail` is data-driven; `noticeVariants` holds the four board variants (approvals, budget, reconcile, approved).
- Preview: `/settings/emails/[template]` now also lists `budget`, `reconcile` and `approved`.

Email constraints followed: 600 px single column, tables with inline styles, solid-colour buttons (no gradients), glyphs instead of SVG icons, bars drawn with nested tables.
