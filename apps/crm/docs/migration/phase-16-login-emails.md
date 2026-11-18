# Phase 16 — Login and emails

- Login (`app/page.tsx`): styles moved to the style-object convention; auth logic unchanged.
- `apps/crm/emails/`: react-email templates (invitation, password reset, report, notices) sharing `EmailLayout` and brand tokens in `theme.ts` (literals, since email clients ignore CSS variables). Each template exposes `PreviewProps`.
- Preview at `/settings/emails/[template]` (linked from the Notifications tab). Sending is not wired yet.
- New deps (pinned): `@react-email/components`, `@react-email/render`.
