# Phase 15 — Settings (UI only)

- Settings panels converted to the style-object convention.
- Roles moved to `settings/data/roles.ts`; new `roles/new` and `roles/[id]/edit` routes with a permission matrix (`RoleForm`, Zod validation).
- Notification rules have working local toggles.
- Users tab and create-user modal already existed and keep their behavior.
