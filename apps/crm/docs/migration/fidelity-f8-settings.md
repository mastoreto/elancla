# Fidelity F8 — Settings

`/settings` and the role forms ported 1:1 to the `crm-s-config-*` boards. UI only, seed data, no Prisma.

## Screens
- Tabs (`BoardTabs`): Usuarios, Iglesia, Cuentas bancarias, Monedas, Roles y permisos, Notificaciones.
  - "Iglesia" stacks identity, bank accounts and currencies as in `crm-s-config-iglesia`; the two other tabs show just their card.
  - Each tab has its own intro line and header action (Crear usuario / Guardar cambios).
- `Crear usuario` dialog (`crm-s-config-usuario-nuevo`), also used to edit a user.
- `/settings/roles/new` and `/settings/roles/[id]/edit`: permission matrix (9 modules × 5 actions + "Todo" switch), profile presets and active-permission counter.

## Code
- `data/`: users, roles, permission modules and presets, finance seeds (accounts, currencies, notification rules).
- `utils/permissions.ts` (+ test): counting, toggling and preset detection.
- Local primitives: `SettingsCheck`, `SettingsToggle`, `RoleProfilePill`.
- Board primitives are copied unchanged from F4. `settings-section-shell.tsx` stays because `/website` still imports it until F7 lands.

## Notes
- Add/edit dialogs for bank accounts and currencies are not in the boards; they reuse `BoardDialogContent`.
- Deleting users and roles removes them from local state.
- `settings/emails` is untouched (F9).
